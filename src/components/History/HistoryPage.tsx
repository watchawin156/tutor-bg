import React, { useState } from 'react';
import { History, CheckCircle, ChevronRight, Calendar } from 'lucide-react';
import { formatThaiDate } from '../../utils/helpers';

const HistoryPage = ({
    enrollments, getStudentInfo, getCourseInfo, attendances
}: any) => {
    const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

    const completedEnrollments = enrollments.filter((e: any) => e.remainingHours === 0);

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 md:mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">ประวัติเรียนจบ</h2>
                <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Completed Courses History</p>
            </div>

            {completedEnrollments.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <History size={36} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">ยังไม่มีนักเรียนที่เรียนจบคอร์ส</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8">
                {completedEnrollments.map((en: any) => {
                    const s = getStudentInfo(en.studentId);
                    const c = getCourseInfo(en.courseId);
                    const isExpanded = expandedHistory === en.id;
                    const studAttendances = attendances.filter((a: any) => a.studentId === en.studentId && a.courseId === en.courseId).sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));

                    return (
                        <div key={en.id} onClick={() => setExpandedHistory(isExpanded ? null : en.id)} className={`bg-white p-6 rounded-[2rem] border-2 transition-all cursor-pointer group shadow-sm ${isExpanded ? 'border-emerald-500 shadow-xl shadow-emerald-50 ring-4 ring-emerald-50/50' : 'border-slate-100 hover:border-emerald-200'}`}>
                            <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-4">
                                <div>
                                    <h4 className="text-[19px] font-black text-slate-800">น้อง{s.nickname}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Student Nickname</p>
                                </div>
                                <span className="text-[9px] font-black bg-emerald-500 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center shadow-md shadow-emerald-100"><CheckCircle size={10} className="mr-1" /> Graduated</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[16px] font-black text-emerald-700 leading-tight">{c.name}</p>
                                    <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">Total: {en.totalHours} Hours</p>
                                </div>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-emerald-700 text-white rotate-90 scale-110' : 'bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center"><Calendar size={14} className="mr-2 text-emerald-600" /> Attendance Records</p>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{studAttendances.length} Sessions</span>
                                    </div>
                                    {studAttendances.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No matching records found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {studAttendances.map((a: any, i: number) => (
                                                <div key={i} className="text-[12px] font-black text-slate-600 bg-slate-50/50 px-3 py-2.5 rounded-2xl border border-slate-100 flex items-center shadow-sm">
                                                    <span className="w-6 h-6 bg-white text-emerald-700 rounded-lg flex items-center justify-center mr-3 shrink-0 font-black text-[10px] border border-emerald-100 shadow-sm">{i + 1}</span>
                                                    {formatThaiDate(a.timestamp || a.date)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HistoryPage;
