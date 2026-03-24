import React, { useState } from 'react';
import { X, UserPlus, Edit3, BookOpen, Plus, DollarSign, Settings2, Users, CheckCircle, Calendar, Trash2, ChevronRight } from 'lucide-react';
import { DAYS_TH, formatThaiDate } from '../../utils/helpers';
import DatePickerModal from './DatePickerModal';

export default function FormsModal({ modalType, formData, setFormData, onClose, onSubmit, teachers, rooms, courses, enrollments, getStudentInfo, getCourseInfo, deleteStudent }: any) {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const DateButton = ({ value, onChange, label }: any) => (
        <div className="flex flex-col">
            <label className="text-[12px] font-black text-slate-500 ml-1 mb-1">{label}</label>
            <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="flex items-center justify-between w-full border border-slate-300 rounded-2xl p-3.5 text-[15px] font-bold bg-white shadow-sm hover:border-emerald-500 transition-all outline-none"
            >
                <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-emerald-700" />
                    <span>{formatThaiDate(value || new Date().toISOString().split('T')[0])}</span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
            </button>
            {showDatePicker && (
                <DatePickerModal
                    value={value || new Date().toISOString().split('T')[0]}
                    onChange={onChange}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-black text-base flex items-center tracking-tight uppercase">
                        {modalType === 'addStudent' ? <><UserPlus size={18} className="mr-2 text-emerald-500" /> เพิ่มนักเรียน</> :
                            modalType === 'editStudent' ? <><Edit3 size={18} className="mr-2 text-emerald-500" /> แก้ไขประวัตินักเรียน</> :
                                modalType === 'enrollStudent' ? <><BookOpen size={18} className="mr-2 text-emerald-500" /> ลงคอร์สเรียน</> :
                                    modalType === 'addCourse' ? <><Plus size={18} className="mr-2 text-emerald-500" /> สร้างคอร์สเรียน</> :
                                        modalType === 'addExpense' ? <><DollarSign size={18} className="mr-2 text-red-500" /> บันทึกรายจ่าย</> :
                                            modalType === 'editCourse' ? <><Edit3 size={18} className="mr-2 text-emerald-500" /> แก้ไขคอร์สเรียน</> : <><DollarSign size={18} className="mr-2 text-emerald-500" /> บันทึกรับเงิน</>}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/30">
                    <form onSubmit={onSubmit} className="p-6 space-y-5">
                        {(modalType === 'addStudent' || modalType === 'editStudent') && (
                            <>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">ชื่อ-นามสกุล</label><input required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="ตย. ด.ช. เรียนดี ขยันยิ่ง" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[13px] font-black text-slate-600 ml-1">ชื่อเล่น</label><input required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="ตย. นนท์" value={formData.nickname || ''} onChange={e => setFormData({ ...formData, nickname: e.target.value })} /></div>
                                    <div>
                                        <label className="text-[13px] font-black text-slate-600 ml-1">ระดับชั้น</label>
                                        <select required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.grade || ''} onChange={e => setFormData({ ...formData, grade: e.target.value })}>
                                            <option value="">เลือกชั้น...</option>
                                            <option value="ก่อนอนุบาล">ก่อนอนุบาล</option>
                                            <option value="อนุบาล 1-3">อนุบาล 1-3</option>
                                            <option value="ป.1-ป.3">ป.1-ป.3</option>
                                            <option value="ป.4-ป.6">ป.4-ป.6</option>
                                            <option value="ม.1-ม.3">ม.1-ม.3</option>
                                            <option value="ม.4-ม.6">ม.4-ม.6</option>
                                        </select>
                                    </div>
                                </div>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">เบอร์โทรผู้ปกครอง (10 หลัก)</label><input required type="tel" pattern="[0-9]{10}" maxLength={10} className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="08xxxxxxxx" value={formData.parentTel || ''} onChange={e => setFormData({ ...formData, parentTel: e.target.value.replace(/\D/g, '') })} /></div>
                                {modalType === 'editStudent' && <button type="button" onClick={() => deleteStudent(formData)} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl text-[13px] font-black mt-6 border border-red-100 hover:bg-red-100 transition-colors flex justify-center items-center shadow-sm"><Trash2 size={16} className="mr-2" /> ลบข้อมูลนักเรียนนี้</button>}
                            </>
                        )}
                        {modalType === 'enrollStudent' && (
                            <>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">วิชาเรียน</label><select required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.courseId || ''} onChange={e => setFormData({ ...formData, courseId: e.target.value })}><option value="">เลือกคอร์ส...</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name} (฿{c.price.toLocaleString()})</option>)}</select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DateButton label="วันที่ลงคอร์ส" value={formData.date} onChange={(d: any) => setFormData({ ...formData, date: d })} />
                                    <div><label className="text-[13px] font-black text-slate-600 ml-1">รูปแบบชำระเงิน</label><select required className="w-full border border-slate-300 rounded-2xl p-4 text-[14px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.enrollType || 'debt'} onChange={e => setFormData({ ...formData, enrollType: e.target.value })}><option value="debt">ค้างชำระได้</option><option value="reduceHours">ตามยอดเงินจริง</option></select></div>
                                </div>
                                <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100"><label className="text-[13px] font-black text-emerald-800 ml-2">ยอดเงินที่ชำระวันนี้ (บาท)</label><input required type="number" className="w-full border border-emerald-200 rounded-3xl p-4 text-[26px] font-black mt-3 text-emerald-700 text-center focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="0" value={formData.payAmount || ''} onChange={e => setFormData({ ...formData, payAmount: e.target.value })} /></div>
                            </>
                        )}
                        {(modalType === 'addCourse' || modalType === 'editCourse') && (
                            <>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">ชื่อวิชา / คอร์ส</label><input required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="ตย. คณิต ป.4 พื้นฐาน" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100"><label className="text-[12px] font-black text-emerald-800 ml-1">ราคาเต็ม</label><input required type="number" className="w-full border-b border-emerald-300 p-2 text-[18px] font-black mt-1 text-emerald-700 text-center outline-none bg-transparent" placeholder="0" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200"><label className="text-[12px] font-black text-slate-700 ml-1">จำนวนครั้ง</label><input required type="number" className="w-full border-b border-slate-300 p-2 text-[18px] font-black mt-1 text-center outline-none bg-transparent" placeholder="0" value={formData.totalSessions || ''} onChange={e => setFormData({ ...formData, totalSessions: e.target.value })} /></div>
                                </div>
                                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
                                    <div className="flex justify-between items-center mb-5"><label className="text-[15px] font-black text-slate-800 flex items-center tracking-tight"><Calendar size={18} className="mr-2 text-emerald-600" /> ตารางสอน</label><button type="button" onClick={() => setFormData({ ...formData, schedulesList: [...(formData.schedulesList || []), { day: '', time: '', teacher: '', room: '' }] })} className="text-[11px] font-black bg-emerald-700 text-white px-4 py-2 rounded-xl active:scale-95 shadow-md flex items-center uppercase tracking-widest"><Plus size={14} className="mr-1" /> เพิ่มวัน</button></div>
                                    {formData.schedulesList?.map((slot: any, index: number) => (
                                        <div key={index} className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 relative shadow-sm group">
                                            {index > 0 && <button type="button" onClick={() => { const newList = [...formData.schedulesList]; newList.splice(index, 1); setFormData({ ...formData, schedulesList: newList }); }} className="absolute -top-2 -right-2 text-white bg-red-500 p-2 rounded-full shadow-lg hover:bg-red-600 transition-all active:scale-90 opacity-0 group-hover:opacity-100"><X size={14} /></button>}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">ครูผู้สอน</label><select required className="w-full border border-slate-200 rounded-xl p-3 text-[14px] font-black bg-slate-50 outline-none cursor-pointer" value={slot.teacher} onChange={e => { const newList = [...formData.schedulesList]; newList[index].teacher = e.target.value; setFormData({ ...formData, schedulesList: newList }); }}><option value="">เลือก...</option>{teachers.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
                                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">ห้องเรียน</label><select required className="w-full border border-slate-200 rounded-xl p-3 text-[14px] font-black bg-slate-50 outline-none cursor-pointer" value={slot.room} onChange={e => { const newList = [...formData.schedulesList]; newList[index].room = e.target.value; setFormData({ ...formData, schedulesList: newList }); }}><option value="">เลือก...</option>{rooms.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">วัน</label><select required className="w-full border border-slate-200 rounded-xl p-3 text-[14px] font-black bg-slate-50 outline-none cursor-pointer" value={slot.day} onChange={e => { const newList = [...formData.schedulesList]; newList[index].day = e.target.value; setFormData({ ...formData, schedulesList: newList }); }}><option value="">เลือก...</option>{Object.keys(DAYS_TH).map(d => <option key={d} value={d}>{(DAYS_TH as any)[d]}</option>)}</select></div>
                                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">เวลา (24 ชม.)</label><input required placeholder="12:00-13:00" className="w-full border border-slate-200 rounded-xl p-3 text-[14px] font-black bg-slate-50 text-center outline-none" value={slot.time} onChange={e => { const newList = [...formData.schedulesList]; newList[index].time = e.target.value; setFormData({ ...formData, schedulesList: newList }); }} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {modalType === 'addPayment' && (
                            <>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">เลือกนักเรียนที่ค้างชำระ</label><select required className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.studentId || ''} onChange={e => setFormData({ ...formData, studentId: e.target.value })}><option value="">เลือกคอร์สที่ค้างเงิน...</option>{enrollments.filter((e: any) => !e.paid).map((en: any) => { const s = getStudentInfo(en.studentId); return <option key={en.id} value={en.studentId}>น้อง{s.nickname} ({getCourseInfo(en.courseId).name} - ค้าง {en.balance}฿)</option> })}</select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DateButton label="วันที่รับเงิน" value={formData.date} onChange={(d: any) => setFormData({ ...formData, date: d })} />
                                    <div><label className="text-[13px] font-black text-slate-600 ml-1">ช่องทาง</label><select required className="w-full border border-slate-300 rounded-2xl p-4 text-[14px] font-bold mt-1.5 focus:border-emerald-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.type || 'เงินสด'} onChange={e => setFormData({ ...formData, type: e.target.value })}><option value="เงินสด">เงินสด</option><option value="โอนเงิน">โอนเงิน</option></select></div>
                                </div>
                                <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 mt-2"><label className="text-[13px] font-black text-emerald-800 ml-2">ยอดรับเงิน (บาท)</label><input required type="number" className="w-full border border-emerald-300 rounded-3xl p-4 text-[26px] font-black mt-3 text-emerald-700 text-center focus:border-emerald-500 outline-none bg-white shadow-sm" placeholder="0" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                            </>
                        )}
                        {modalType === 'addExpense' && (
                            <>
                                <div><label className="text-[13px] font-black text-slate-600 ml-1">ชื่อรายการจ่าย</label><input required placeholder="เช่น ค่าชีท, ค่าจ้างครู, ค่าไฟ..." className="w-full border border-slate-300 rounded-2xl p-4 text-[15px] font-bold mt-1.5 focus:border-red-500 outline-none bg-white shadow-sm" value={formData.expenseName || ''} onChange={e => setFormData({ ...formData, expenseName: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DateButton label="วันที่จ่าย" value={formData.date} onChange={(d: any) => setFormData({ ...formData, date: d })} />
                                    <div><label className="text-[13px] font-black text-slate-600 ml-1">ช่องทาง</label><select required className="w-full border border-slate-300 rounded-2xl p-4 text-[14px] font-bold mt-1.5 focus:border-red-500 outline-none bg-white shadow-sm cursor-pointer" value={formData.type || 'เงินสด'} onChange={e => setFormData({ ...formData, type: e.target.value })}><option value="เงินสด">เงินสด</option><option value="โอนเงิน">โอนเงิน</option></select></div>
                                </div>
                                <div className="bg-red-50 p-5 rounded-[2rem] border border-red-100 mt-2"><label className="text-[13px] font-black text-red-800 ml-2">ยอดรายจ่ายจริง (บาท)</label><input required type="number" className="w-full border border-red-300 rounded-3xl p-4 text-[26px] font-black mt-3 text-red-600 text-center focus:border-red-500 outline-none bg-white shadow-sm" placeholder="0" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                            </>
                        )}
                        <div className="pt-6"><button type="submit" className={`w-full text-white font-black py-5 rounded-2xl text-[16px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex justify-center items-center ${modalType === 'addExpense' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-100'}`}><CheckCircle size={20} className="mr-2" /> บันทึกข้อมูล</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
}
