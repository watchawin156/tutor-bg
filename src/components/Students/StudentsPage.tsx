import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Phone, Edit3, Users, Plus, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { getPercentColor } from '../../utils/helpers';

const StudentsPage = ({
    students, setStudents,
    enrollments, setEnrollments,
    courses, getCourseInfo,
    getStudentInfo, setModalType, setFormData
}: any) => {
    const [searchQuery, setSearchQuery] = useState('');

    const searchedStudents = useMemo(() =>
        students.filter((s: any) =>
            (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [students, searchQuery]
    );

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">ทะเบียนนักเรียน</h2>
                    <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Student Management</p>
                </div>
                <div className="flex w-full md:w-auto space-x-2">
                    <div className="relative shadow-sm flex-1 md:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" placeholder="ค้นหาชื่อ..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-bold outline-none bg-white transition-all shadow-sm"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setFormData({}); setModalType('addStudent'); }}
                        className="bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center active:scale-95 hover:bg-emerald-800 transition-all shrink-0"
                    >
                        <UserPlus size={20} className="md:mr-2" />
                        <span className="hidden md:inline uppercase tracking-widest text-xs">เพิ่มนักเรียน</span>
                    </button>
                </div>
            </div>

            {searchedStudents.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users size={36} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">ยังไม่มีข้อมูลนักเรียน</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8">
                {searchedStudents.map((s: any) => {
                    const sEnrollments = enrollments.filter((e: any) => e.studentId === s.id && e.remainingHours > 0).sort((a: any, b: any) => a.remainingHours - b.remainingHours);
                    return (
                        <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div className="flex items-center min-w-0">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white text-emerald-700 font-black text-2xl flex items-center justify-center border-2 border-slate-50 shadow-sm shrink-0 mr-4 group-hover:scale-110 transition-transform">{s.nickname?.[0] || '?'}</div>
                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="text-[20px] text-slate-800 font-black truncate">น้อง{s.nickname}</h4>
                                            <button onClick={() => { setFormData(s); setModalType('editStudent'); }} className="text-slate-300 hover:text-emerald-600 bg-white shadow-sm p-1.5 rounded-xl border border-slate-100 active:scale-90 transition-all"><Edit3 size={14} /></button>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1.5">
                                            <span className="text-[9px] font-black bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-lg uppercase tracking-widest">{s.grade}</span>
                                            <a href={`tel:${s.parentTel}`} className="text-[10px] font-black text-emerald-700 flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-widest"><Phone size={10} className="mr-1" /> Call Parent</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <button
                                    onClick={() => { setFormData({ studentId: s.id, enrollType: 'debt' }); setModalType('enrollStudent'); }}
                                    className="w-full flex items-center justify-center bg-white border-2 border-emerald-100 text-emerald-700 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
                                >
                                    <Plus size={16} className="mr-2" /> ลงวิชาเรียนเพิ่ม
                                </button>

                                <div className="space-y-3 flex-1">
                                    {sEnrollments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                                            <AlertCircle size={20} className="text-slate-300 mb-2" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Courses</p>
                                        </div>
                                    ) : (
                                        sEnrollments.map((en: any) => {
                                            const course = getCourseInfo(en.courseId);
                                            return (
                                                <div key={en.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-emerald-200 transition-colors">
                                                    <div className="min-w-0 pr-3">
                                                        <p className="text-[14px] text-slate-800 font-black truncate">{course.name}</p>
                                                        {!en.paid && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Payment Pending</p>}
                                                    </div>
                                                    <div className="flex items-center space-x-2 shrink-0">
                                                        {!en.paid && (
                                                            <button
                                                                onClick={() => { setFormData({ studentId: s.id, courseId: en.courseId, type: 'เงินสด' }); setModalType('addPayment'); }}
                                                                className="text-[10px] bg-red-500 text-white px-3 py-1.5 rounded-xl font-black shadow-md shadow-red-100 active:scale-95 hover:bg-red-600 transition-all animate-pulse"
                                                            >
                                                                ค้าง {en.balance}฿
                                                            </button>
                                                        )}
                                                        <div className={`px-3 py-1.5 rounded-xl border-2 flex flex-col items-center justify-center min-w-[65px] ${getPercentColor(en.remainingHours, en.totalHours)}`}>
                                                            <span className="text-[11px] font-black leading-none">{en.remainingHours}</span>
                                                            <span className="text-[7px] font-black uppercase tracking-tighter mt-1 opacity-60">Hrs Left</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentsPage;
