import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function ManageBasicsModal({ teachers, setTeachers, rooms, setRooms, onClose }: any) {
    const [basicTab, setBasicTab] = React.useState('teacher');
    const [tempData, setTempData] = React.useState('');

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="font-black text-sm">จัดการข้อมูลพื้นฐาน</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={18} /></button>
                </div>
                <div className="flex border-b border-slate-200 text-sm font-bold bg-slate-50">
                    <button onClick={() => { setBasicTab('teacher'); setTempData(''); }} className={`flex-1 py-3 transition-colors ${basicTab === 'teacher' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>รายชื่อครู</button>
                    <button onClick={() => { setBasicTab('room'); setTempData(''); }} className={`flex-1 py-3 transition-colors ${basicTab === 'room' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>ห้องเรียน</button>
                </div>
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {basicTab === 'teacher' ? (
                        <div className="animate-in fade-in">
                            <form onSubmit={(e) => { e.preventDefault(); if (tempData.trim()) { setTeachers([...teachers, { id: Date.now(), name: tempData }]); setTempData(''); } }} className="flex space-x-2 mb-4">
                                <input required className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-[14px] font-bold focus:border-emerald-500 outline-none" placeholder="พิมพ์ชื่อครู..." value={tempData} onChange={e => setTempData(e.target.value)} />
                                <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 rounded-xl text-sm font-black shadow-sm transition-colors">เพิ่ม</button>
                            </form>
                            <div className="space-y-2">
                                {teachers.map((t: any) => (
                                    <div key={t.id} className="text-sm bg-white border border-slate-200 px-4 py-3 rounded-xl flex justify-between items-center font-bold shadow-sm">
                                        <span className="text-slate-700">{t.name}</span>
                                        <button onClick={() => { if (window.confirm(`ลบครู ${t.name}?`)) setTeachers(teachers.filter((x: any) => x.id !== t.id)) }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in">
                            <form onSubmit={(e) => { e.preventDefault(); if (tempData.trim()) { setRooms([...rooms, { id: Date.now(), name: tempData }]); setTempData(''); } }} className="flex space-x-2 mb-4">
                                <input required className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-[14px] font-bold focus:border-emerald-500 outline-none" placeholder="พิมพ์ชื่อห้อง..." value={tempData} onChange={e => setTempData(e.target.value)} />
                                <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 rounded-xl text-sm font-black shadow-sm transition-colors">เพิ่ม</button>
                            </form>
                            <div className="space-y-2">
                                {rooms.map((r: any) => (
                                    <div key={r.id} className="text-sm bg-white border border-slate-200 px-4 py-3 rounded-xl flex justify-between items-center font-bold shadow-sm">
                                        <span className="text-slate-700">{r.name}</span>
                                        <button onClick={() => { if (window.confirm(`ลบห้อง ${r.name}?`)) setRooms(rooms.filter((x: any) => x.id !== r.id)) }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
