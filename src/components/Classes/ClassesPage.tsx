import React from 'react';
import { Settings2, Plus, Filter, BookOpen, Users, Building, CheckCircle, Edit3, Trash2, Clock, Calendar } from 'lucide-react';
import { DAYS_TH } from '../../utils/helpers';

const ClassesPage = ({
    courses, schedules, getCourseInfo,
    selectedTeacher, setSelectedTeacher,
    teachersList, setModalType, setFormData,
    setSelectedClass, setCheckDate,
    deleteCourse, openEditCourse, enrollments
}: any) => {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">คอร์ส & ตารางสอน</h2>
                    <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Course & Schedule Management</p>
                </div>
                <div className="flex w-full md:w-auto space-x-2">
                    <button
                        onClick={() => { setModalType('manageBasics'); }}
                        className="flex-1 md:flex-none justify-center bg-white border-2 border-slate-100 px-5 py-3.5 rounded-2xl font-black text-slate-600 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center uppercase tracking-widest text-[11px]"
                    >
                        <Settings2 size={18} className="mr-2 text-slate-400" /> ครู/ห้อง
                    </button>
                    <button
                        onClick={() => { setFormData({ schedulesList: [{ day: '', time: '', teacher: '', room: '' }] }); setModalType('addCourse'); }}
                        className="flex-1 md:flex-none justify-center bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center active:scale-95 hover:bg-emerald-800 transition-all uppercase tracking-widest text-[11px]"
                    >
                        <Plus size={18} className="mr-2" /> สร้างวิชา
                    </button>
                </div>
            </div>

            <div className="flex items-center bg-white border-2 border-slate-50 rounded-2xl px-5 py-3.5 shadow-sm mb-8 max-w-sm group focus-within:border-emerald-500 transition-all">
                <Filter size={18} className="text-slate-300 mr-3 group-hover:text-emerald-500 transition-colors" />
                <select
                    className="text-[15px] font-black text-emerald-700 bg-transparent outline-none w-full cursor-pointer"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                    {teachersList.map((t: any) => <option key={t} value={t}>{t === 'ทั้งหมด' ? 'กรองดูวิชาทั้งหมด' : `กรองดูเฉพาะ: ครู${t}`}</option>)}
                </select>
            </div>

            <div className="space-y-12">
                {courses.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <BookOpen size={36} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 text-sm font-black uppercase tracking-widest">ยังไม่มีข้อมูลคอร์สเรียน</p>
                    </div>
                )}

                {Object.keys(DAYS_TH).map(dayKey => {
                    let daySchedules = schedules.filter((s: any) => s.day === dayKey).sort((a: any, b: any) => (a.start || '').localeCompare(b.start || ''));
                    if (selectedTeacher !== 'ทั้งหมด') daySchedules = daySchedules.filter((s: any) => s.teacher === selectedTeacher);
                    if (daySchedules.length === 0) return null;

                    const dayColors: any = {
                        Sunday: 'bg-red-500 shadow-red-100',
                        Monday: 'bg-yellow-400 shadow-yellow-100',
                        Tuesday: 'bg-pink-400 shadow-pink-100',
                        Wednesday: 'bg-emerald-500 shadow-emerald-100',
                        Thursday: 'bg-orange-500 shadow-orange-100',
                        Friday: 'bg-blue-400 shadow-blue-100',
                        Saturday: 'bg-purple-500 shadow-purple-100'
                    };

                    const dayNamesShort: any = {
                        Sunday: 'SUN', Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT'
                    };

                    return (
                        <div key={dayKey} className="relative">
                            <div className="flex items-center mb-6">
                                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] ${dayColors[dayKey]} text-white flex flex-col items-center justify-center shadow-lg transform -rotate-12 hover:rotate-0 transition-all cursor-default`}>
                                    <span className="text-[10px] md:text-[12px] font-black leading-none opacity-80 uppercase tracking-tighter">{dayNamesShort[dayKey]}</span>
                                    <span className="text-[16px] md:text-[22px] font-black">{(DAYS_TH as any)[dayKey]}</span>
                                </div>
                                <div className="ml-6 flex-1 h-px bg-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {daySchedules.map((sch: any) => {
                                    const c = getCourseInfo(sch.courseId);
                                    if (!c) return null;
                                    const activeStuds = enrollments.filter((e: any) => e.courseId === c.id && e.remainingHours > 0).length;
                                    return (
                                        <div key={sch.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all relative group">
                                            <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-50">
                                                <div className="flex items-center text-emerald-700 font-black text-[13px] bg-white px-3 py-1.5 rounded-xl border border-emerald-50 shadow-sm">
                                                    <Clock size={14} className="mr-1.5" /> {sch.start} - {sch.end} น.
                                                </div>
                                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                    <button onClick={() => openEditCourse(c)} className="p-2 text-slate-400 hover:text-emerald-600 bg-white border border-slate-100 rounded-xl shadow-sm transition-all active:scale-90"><Edit3 size={15} /></button>
                                                    <button onClick={() => deleteCourse(c)} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-100 rounded-xl shadow-sm transition-all active:scale-90"><Trash2 size={15} /></button>
                                                </div>
                                            </div>
                                            <div className="p-6 pb-4">
                                                <h4 className="text-[20px] text-slate-800 font-black leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-tighter">{c.name}</h4>
                                                <div className="mt-4 flex flex-col space-y-2">
                                                    <div className="flex items-center text-[12px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-2.5 py-1 rounded-lg">
                                                        <Users size={14} className="mr-2 text-slate-300" /> ครู{sch.teacher}
                                                    </div>
                                                    <div className="flex items-center text-[12px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-2.5 py-1 rounded-lg">
                                                        <Building size={14} className="mr-2 text-slate-300" /> ห้อง {sch.room}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto px-6 py-5 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Students enrolled</span>
                                                    <span className="text-emerald-700 font-black text-[16px] leading-none">{activeStuds} <span className="text-[10px] text-slate-400 uppercase">Pax</span></span>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedClass(sch); setCheckDate(new Date().toISOString().split('T')[0]); }}
                                                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[12px] font-black flex items-center shadow-lg active:scale-95 hover:bg-emerald-700 transition-all uppercase tracking-widest"
                                                >
                                                    <CheckCircle size={16} className="mr-2" /> เช็คชื่อ
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClassesPage;
