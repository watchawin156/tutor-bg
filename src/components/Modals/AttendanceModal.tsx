import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, History, ChevronRight } from 'lucide-react';
import { formatThaiDate } from '../../utils/helpers';
import DatePickerModal from './DatePickerModal';

export default function AttendanceModal({ selectedClass, onClose, checkDate, setCheckDate, enrollments, attendances, getStudentInfo, getCourseInfo, getRoundText, undoAttendance, deductHour }: any) {
    const [swipedId, setSwipedId] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const touchStartX = React.useRef(0);

    const classEnrs = enrollments.filter((e: any) => e.courseId === selectedClass.courseId);
    const activeClassEnrs = classEnrs.filter((e: any) => e.remainingHours > 0);
    const completedClassEnrs = classEnrs.filter((e: any) => e.remainingHours === 0);

    const renderStudentCard = (en: any) => {
        const s = getStudentInfo(en.studentId);
        const isChecked = attendances.some((a: any) => a.studentId === s.id && a.courseId === selectedClass.courseId && a.date === checkDate);
        const roundText = getRoundText(s.id, selectedClass.courseId, en.id);

        return (
            <div key={en.id} className="relative overflow-hidden mb-3 rounded-2xl shadow-sm bg-red-50 group">
                {isChecked && (
                    <div className="absolute inset-y-0 right-0 w-24 flex">
                        <button
                            onClick={() => undoAttendance(s.id, selectedClass.courseId)}
                            className="w-full bg-red-500 text-white font-black text-[12px] flex flex-col items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <X size={18} className="mb-1" /> ยกเลิก
                        </button>
                    </div>
                )}
                <div
                    onTouchStart={(e) => { if (isChecked) touchStartX.current = e.touches[0].clientX; }}
                    onTouchMove={(e) => {
                        if (!isChecked) return;
                        const diff = touchStartX.current - e.touches[0].clientX;
                        if (diff > 40) setSwipedId(en.id as any);
                        else if (diff < -40) setSwipedId(null);
                    }}
                    className={`relative p-4 flex justify-between items-center transition-transform duration-300 ${swipedId === en.id && isChecked ? '-translate-x-24' : 'translate-x-0'
                        } ${isChecked ? 'bg-slate-50 border border-slate-200' : 'bg-white border border-slate-200'}`}
                >
                    <div>
                        <p className={`font-black text-[16px] ${isChecked ? 'text-slate-500' : 'text-slate-800'}`}>
                            น้อง{s.nickname} <span className="text-emerald-600 text-[12px] ml-1">{roundText}</span>
                        </p>
                        <p className="text-[12px] font-bold text-slate-500 mt-1 flex items-center"><Clock size={12} className="mr-1" /> เหลือ {en.remainingHours} ชม.</p>
                    </div>
                    {isChecked ? (
                        <span className="text-[12px] font-black px-4 py-2 rounded-xl text-emerald-600 bg-emerald-100 border border-emerald-200 flex items-center shadow-sm">
                            <CheckCircle size={16} className="mr-1" /> เช็คแล้ว
                        </span>
                    ) : (
                        <button onClick={() => deductHour(s.id, selectedClass.courseId)} className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-black shadow-md active:scale-95 hover:bg-emerald-800 transition-colors">เช็คชื่อ</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-end md:items-center justify-center md:p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 bg-emerald-800 text-white flex justify-between items-center shrink-0">
                    <div><h3 className="text-lg font-black leading-tight">{getCourseInfo(selectedClass.courseId)?.name}</h3><p className="text-[12px] font-bold mt-1 text-emerald-200 bg-emerald-900/50 inline-block px-2 py-0.5 rounded">เวลา {selectedClass.start}-{selectedClass.end} น.</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">วันที่เช็คชื่อ</span>
                        <button
                            onClick={() => setShowDatePicker(true)}
                            className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-black text-slate-700 hover:bg-slate-100 transition-all active:scale-95 group"
                        >
                            <Calendar size={18} className="text-emerald-700 group-hover:scale-110 transition-transform" />
                            <span className="text-[15px]">{formatThaiDate(checkDate)}</span>
                            <ChevronRight size={16} className="text-slate-300" />
                        </button>
                    </div>
                </div>

                <div className="p-5 bg-slate-100 flex-1 overflow-y-auto">
                    {activeClassEnrs.length === 0 && completedClassEnrs.length === 0 && <p className="text-center text-sm font-bold text-slate-400 py-10">ไม่มีนักเรียนในวิชานี้</p>}
                    {activeClassEnrs.map(renderStudentCard)}
                    {completedClassEnrs.length > 0 && (
                        <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center"><History size={14} className="mr-2" /> ผู้เคยเรียน / เรียนครบแล้ว</h4>
                            {completedClassEnrs.map(renderStudentCard)}
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest shrink-0 transition-colors">ปิดหน้าต่าง</button>
            </div>

            {showDatePicker && (
                <DatePickerModal
                    value={checkDate}
                    onChange={setCheckDate}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </div>
    );
}
