import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UploadMRI from '../dashboard/UploadMRI';
import Results from '../dashboard/Results';
import History from '../dashboard/History';
import Sidebar from '../components/Sidebar';
import DoctorPlans from '../dashboard/DoctorPlans';
import { useAuth } from '../context/AuthContext';
import { feedbackApi } from '../services/api';
import { downloadReport } from '../utils/reportGenerator';
import {
    Sparkles,
    Activity,
    ShieldCheck,
    Clock,
    Download,
    Share2,
    MoreHorizontal,
    UserCircle,
    Settings,
    Zap,
    BrainCircuit,
    Cpu,
    Fingerprint,
    MessageSquareQuote,
    Stethoscope
} from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [lastResult, setLastResult] = useState(null);
    const [suggestedDoctors, setSuggestedDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState('analyze');
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = [
        { label: 'Past Checks', value: '12', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'ML Model Score', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'System Status', value: 'Online', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-grow ml-0 lg:ml-72 px-6 py-8 lg:px-12 lg:py-10 relative overflow-y-auto">
                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">Your Portal</span>
                                <span className="text-slate-400 text-xs font-semibold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                                Hello, {user.name.split(' ')[0]}
                            </h1>
                            <p className="text-slate-500 font-medium text-lg mt-1">Everything looks good today.</p>
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[160px]">
                                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                                        <span className="text-lg font-bold text-slate-900 leading-none">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </header>

                    {/* Main Card Section */}
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm min-h-[60vh]"
                        >
                            {activeTab === 'analyze' && (
                                <div className="max-w-3xl mx-auto">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Check MRI Scan</h2>
                                        <p className="text-slate-500 font-medium tracking-tight">Upload your brain photo to see your health report.</p>
                                    </div>

                                    <UploadMRI onResult={(res) => {
                                        setLastResult(res);
                                        // Store suggested doctors if available
                                        if (res.suggestedDoctors) {
                                            setSuggestedDoctors(res.suggestedDoctors);
                                        }
                                    }} />

                                    {lastResult && (
                                        <div className="mt-16 pt-12 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-5">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-2xl font-bold text-slate-900">Your Result</h3>
                                                <div className="flex gap-4">
                                                    {lastResult.suggestedDoctors && (
                                                        <button
                                                            onClick={() => navigate('/doctors', {
                                                                state: {
                                                                    suggestedDoctors: lastResult.suggestedDoctors,
                                                                    prediction: lastResult.prediction
                                                                }
                                                            })}
                                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                        >
                                                            <Stethoscope className="w-4 h-4" /> FIND SPECIALIST
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            downloadReport({
                                                                userName: user.name,
                                                                userEmail: user.email,
                                                                age: lastResult.age || '',
                                                                gender: lastResult.gender || '',
                                                                mmse: lastResult.mmse || '',
                                                                cdr: lastResult.cdr || '',
                                                                prediction: lastResult.prediction,
                                                                confidence: lastResult.confidence,
                                                                gradCamImage: lastResult.grad_cam_image || lastResult.gradCamImage,
                                                                createdAt: lastResult.createdAt || new Date().toISOString()
                                                            });
                                                        }}
                                                        className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                        title="Download PDF Report"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(window.location.origin + '/results/' + (lastResult.grad_cam_image || lastResult.gradCamImage));
                                                            alert('Grad-CAM visualization link copied to clipboard!');
                                                        }}
                                                        className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
                                                        title="Copy Shareable Link"
                                                    >
                                                        <Share2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <Results result={lastResult} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'my-plans' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Plans</h2>
                                        <p className="text-slate-500 font-medium">View health plans assigned by your doctor.</p>
                                    </div>
                                    <DoctorPlans />
                                </div>
                            )}

                            {activeTab === 'feedback' && (
                                <div className="max-w-xl mx-auto py-10">
                                    <div className="text-center mb-10">
                                        <div className="inline-flex w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl items-center justify-center mb-6 border border-indigo-100">
                                            <MessageSquareQuote className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Share Feedback</h2>
                                        <p className="text-slate-500 font-medium">Help us improve our ML Model system by sharing your experience.</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const content = e.target.feedback.value;
                                        if (!content) return;
                                        try {
                                            await feedbackApi.submit({ content, rating: 5 });
                                            alert("Thank you for your feedback! The platform admins will review it.");
                                            e.target.reset();
                                        } catch (err) {
                                            alert("Failed to submit feedback.");
                                        }
                                    }}>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Experience</label>
                                            <textarea
                                                name="feedback"
                                                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all min-h-[180px] font-semibold text-slate-800 placeholder:text-slate-300"
                                                placeholder="What did you think of the analysis?"
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-slate-200 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                            Send Feedback <Zap className="w-4 h-4 text-indigo-300" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="max-w-5xl mx-auto">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Past History</h2>
                                        <p className="text-slate-500 font-medium">Your previous MRI test results.</p>
                                    </div>
                                    <History />
                                </div>
                            )}


                        </motion.section>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
