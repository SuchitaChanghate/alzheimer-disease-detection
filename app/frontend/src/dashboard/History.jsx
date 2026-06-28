import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { predictApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadReport } from '../utils/reportGenerator';
import Results from './Results';
import { History as HistoryIcon, Calendar, Info, Loader2, X, Download } from 'lucide-react';

const History = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await predictApi.history();
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <section className="mt-12">
            <div className="flex items-center gap-2 mb-4">
                <HistoryIcon className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-800 text-base">Patient Analysis History</h3>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Context</th>
                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">MRI Stage</th>
                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Conf.</th>
                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10 text-slate-400">No diagnostic records found.</td></tr>
                        ) : (
                            history.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">AGE: {record.age}</span>
                                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">MMSE: {record.mmse}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${record.prediction === 'AD' ? 'bg-red-100 text-red-700' :
                                            record.prediction === 'MCI' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {record.prediction === 'AD' ? "Alzheimer's Risk" : record.prediction === 'MCI' ? "Early Changes" : "Healthy Scan"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[11px] font-bold text-slate-500">{Math.round(record.confidence * 100)}%</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => setSelectedRecord(record)}
                                                className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer"
                                            >
                                                View Report
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    downloadReport({
                                                        userName: user?.name || 'N/A',
                                                        userEmail: user?.email || 'N/A',
                                                        age: record.age || '',
                                                        gender: record.gender || '',
                                                        mmse: record.mmse || '',
                                                        cdr: record.cdr || '',
                                                        prediction: record.prediction,
                                                        confidence: record.confidence,
                                                        gradCamImage: record.gradCamImage || record.grad_cam_image || '',
                                                        createdAt: record.createdAt
                                                    });
                                                }}
                                                className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-100 transition-all cursor-pointer"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Report Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 overflow-y-auto">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                    >
                        <button 
                            onClick={() => setSelectedRecord(null)}
                            className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">Diagnostic Report Details</span>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">Test Report: {new Date(selectedRecord.createdAt).toLocaleDateString()}</h3>
                            </div>
                            <button
                                onClick={() => {
                                    downloadReport({
                                        userName: user?.name || 'N/A',
                                        userEmail: user?.email || 'N/A',
                                        age: selectedRecord.age || '',
                                        gender: selectedRecord.gender || '',
                                        mmse: selectedRecord.mmse || '',
                                        cdr: selectedRecord.cdr || '',
                                        prediction: selectedRecord.prediction,
                                        confidence: selectedRecord.confidence,
                                        gradCamImage: selectedRecord.gradCamImage || selectedRecord.grad_cam_image || '',
                                        createdAt: selectedRecord.createdAt
                                    });
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer"
                            >
                                <Download className="w-4 h-4" /> DOWNLOAD PDF REPORT
                            </button>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Patient Name</span>
                                <span className="font-bold text-slate-900 text-sm">{user?.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Age & Gender</span>
                                <span className="font-bold text-slate-900 text-sm">{selectedRecord.age || 'N/A'} yrs / {selectedRecord.gender === 'M' || selectedRecord.gender === 0 || selectedRecord.gender === '0' ? 'Male' : 'Female'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">MMSE score</span>
                                <span className="font-bold text-slate-900 text-sm">{selectedRecord.mmse || 'N/A'} / 30</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">CDR score</span>
                                <span className="font-bold text-slate-900 text-sm">{selectedRecord.cdr || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Reuse Results component */}
                        <Results result={{
                            prediction: selectedRecord.prediction,
                            confidence: selectedRecord.confidence,
                            grad_cam_image: selectedRecord.gradCamImage || selectedRecord.grad_cam_image || ''
                        }} />
                    </motion.div>
                </div>
            )}
        </section >
    );
};

export default History;
