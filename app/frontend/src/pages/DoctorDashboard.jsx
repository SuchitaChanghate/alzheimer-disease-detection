import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { planApi, reviewApi, doctorApi } from '../services/api';
import { motion } from 'framer-motion';
import {
    Users,
    Activity,
    Loader2,
    Search,
    Filter,
    Stethoscope,
    ClipboardList,
    TrendingUp,
    ShieldAlert,
    Clock,
    UserCheck,
    Download,
    Plus,
    Trash2,
    Star,
    MessageSquare,
    ChevronRight,
    X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { downloadReport } from '../utils/reportGenerator';
import Results from '../dashboard/Results';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('patients');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [newPlan, setNewPlan] = useState({ name: '', price: '', features: '', duration: 'Monthly' });
    const [selectedPatientReport, setSelectedPatientReport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const [patientRes, planRes, reviewRes] = await Promise.all([
                    doctorApi.getPatients(),
                    planApi.getPlans(user._id),
                    reviewApi.getDoctorReviews(user._id)
                ]);
                setPatients(patientRes.data);
                setPlans(planRes.data);
                setReviews(reviewRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user._id]);

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const data = { ...newPlan, features: newPlan.features.split(',').map(f => f.trim()) };
            await planApi.createPlan(data);
            const res = await planApi.getPlans(user._id);
            setPlans(res.data);
            setShowPlanModal(false);
            setNewPlan({ name: '', price: '', features: '', duration: 'Monthly' });
        } catch (err) {
            alert("Failed to create plan");
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await planApi.deletePlan(id);
            setPlans(plans.filter(p => p._id !== id));
        } catch (err) {
            alert("Failed to delete plan");
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
            <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Clinical Portal...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-outfit">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-grow ml-0 lg:ml-72 px-6 py-8 lg:px-12 lg:py-10 overflow-y-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">Medical Professional</span>
                            <span className="text-slate-400 text-xs font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h2 className="text-5xl font-bold text-slate-900 tracking-tight">
                            Doctor Portal
                        </h2>
                        <p className="text-slate-500 font-medium text-lg mt-1">
                            {activeTab === 'patients' ? "Review patient reports and ML Model analysis results." :
                                activeTab === 'doctor-plans' ? "Manage your subscription offerings." :
                                    "Monitor patient feedback and ratings."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.specialization || 'Neurologist'}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Patients', value: new Set(patients.map(p => p.userEmail)).size, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Avg Rating', value: user.rating || '5.0', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Critical Cases', value: patients.filter(p => p.prediction === 'AD').length, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Active Plans', value: plans.length, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[50vh]"
                >
                    {activeTab === 'patients' && (
                        <>
                            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="font-bold text-slate-900 text-xl tracking-tight">Patient Records</h3>
                                <div className="relative group w-full sm:w-auto">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="w-full sm:w-80 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-4">Patient Profile</th>
                                            <th className="px-8 py-4">ML Model Analysis</th>
                                            <th className="px-8 py-4 text-center">Confidence</th>
                                            <th className="px-8 py-4">Record Date</th>
                                            <th className="px-8 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {patients.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-30">
                                                        <Users className="w-12 h-12 mb-4" />
                                                        <p className="font-bold uppercase tracking-widest text-xs">No patients subscribed yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : patients.map((p, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-200 group-hover:bg-white transition-all">
                                                            {p.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">{p.userName}</span>
                                                            <span className="text-[11px] text-slate-400 font-semibold tracking-tight">{p.userEmail}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border shadow-sm ${p.prediction === 'AD' ? 'bg-red-50 text-red-600 border-red-100' : p.prediction === 'MCI' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                        {p.prediction === 'AD' ? "ALZHEIMER'S RISK" : p.prediction === 'MCI' ? "EARLY CHANGES" : "HEALTHY SCAN"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-base font-bold text-slate-900">{Math.round(p.confidence * 100)}%</span>
                                                </td>
                                                <td className="px-8 py-6 font-bold text-slate-600 text-xs">
                                                    {new Date(p.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button 
                                                            onClick={() => setSelectedPatientReport(p)}
                                                            className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer font-outfit"
                                                        >
                                                            View Report
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                downloadReport({
                                                                    userName: p.userName,
                                                                    userEmail: p.userEmail,
                                                                    age: p.age || '',
                                                                    gender: p.gender || '',
                                                                    mmse: p.mmse || '',
                                                                    cdr: p.cdr || '',
                                                                    prediction: p.prediction,
                                                                    confidence: p.confidence,
                                                                    gradCamImage: p.gradCamImage || p.grad_cam_image || '',
                                                                    createdAt: p.createdAt
                                                                });
                                                            }}
                                                            className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer font-outfit"
                                                            title="Download PDF Report"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'doctor-plans' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-slate-900">Subscription Plans</h3>
                                <button
                                    onClick={() => setShowPlanModal(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                >
                                    <Plus className="w-4 h-4" /> ADD NEW PLAN
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map((plan) => (
                                    <div key={plan._id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                                        <button
                                            onClick={() => handleDeletePlan(plan._id)}
                                            className="absolute top-4 right-4 p-2 bg-white text-slate-300 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                                        <div className="text-3xl font-bold text-indigo-600 mb-4">₹{plan.price}</div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Features</p>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((f, i) => (
                                                <li key={i} className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-indigo-300 rounded-full" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-[10px] bg-white px-3 py-1 rounded-full border border-slate-100 font-bold text-slate-500 inline-block uppercase">
                                            Billing: {plan.duration}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'doctor-reviews' && (
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-10">Patient Feedback</h3>
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">No reviews yet.</div>
                                ) : reviews.map((r) => (
                                    <div key={r._id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-bold shadow-sm shrink-0 border border-slate-100">
                                            {r.userName.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{r.userName}</h4>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-400 bg-white px-2 py-1 rounded-lg border border-slate-100 text-xs font-bold">
                                                    <Star className="w-3 h-3 fill-current" /> {r.rating}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">"{r.comment}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Plan Creation Modal */}
                {showPlanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
                            <h3 className="text-3xl font-bold text-slate-900 mb-6">Create New Plan</h3>
                            <form onSubmit={handleCreatePlan} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
                                    <input type="text" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-600 font-medium" placeholder="E.g. Standard Consultation" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                                        <input type="number" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-600 font-bold text-indigo-600" placeholder="1000" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                        <select value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-600 font-bold uppercase tracking-widest text-[10px]">
                                            <option>Monthly</option>
                                            <option>Yearly</option>
                                            <option>One-Time</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Features (Comma separated)</label>
                                    <textarea value={newPlan.features} onChange={e => setNewPlan({ ...newPlan, features: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-600 font-medium h-24" placeholder="Report Audit, Email Support, etc." required />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                                    <button type="submit" className="flex-grow py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all">Create Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Patient Report Detail Modal */}
                {selectedPatientReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setSelectedPatientReport(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                <div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">Clinical Diagnostic Report Details</span>
                                    <h3 className="text-3xl font-bold text-slate-900 mt-2">Patient: {selectedPatientReport.userName}</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        downloadReport({
                                            userName: selectedPatientReport.userName,
                                            userEmail: selectedPatientReport.userEmail,
                                            age: selectedPatientReport.age || '',
                                            gender: selectedPatientReport.gender || '',
                                            mmse: selectedPatientReport.mmse || '',
                                            cdr: selectedPatientReport.cdr || '',
                                            prediction: selectedPatientReport.prediction,
                                            confidence: selectedPatientReport.confidence,
                                            gradCamImage: selectedPatientReport.gradCamImage || selectedPatientReport.grad_cam_image || '',
                                            createdAt: selectedPatientReport.createdAt
                                        });
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer font-outfit"
                                >
                                    <Download className="w-4 h-4" /> DOWNLOAD PDF REPORT
                                </button>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Patient Email</span>
                                    <span className="font-bold text-slate-900 text-sm break-all">{selectedPatientReport.userEmail}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Age & Gender</span>
                                    <span className="font-bold text-slate-900 text-sm">{selectedPatientReport.age || 'N/A'} yrs / {selectedPatientReport.gender === 'M' || selectedPatientReport.gender === 0 || selectedPatientReport.gender === '0' ? 'Male' : 'Female'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">MMSE score</span>
                                    <span className="font-bold text-slate-900 text-sm">{selectedPatientReport.mmse || 'N/A'} / 30</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">CDR score</span>
                                    <span className="font-bold text-slate-900 text-sm">{selectedPatientReport.cdr || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Reuse Results component */}
                            <Results result={{
                                prediction: selectedPatientReport.prediction,
                                confidence: selectedPatientReport.confidence,
                                grad_cam_image: selectedPatientReport.gradCamImage || selectedPatientReport.grad_cam_image || ''
                            }} />
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;
