import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Search, AlertCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const usersCol = collection(db, 'users');
        const unsub = onSnapshot(usersCol, (snap) => {
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setUsers(data);
            setLoading(false);
        }, (err) => {
            console.error("Failed to load users", err);
            setLoading(false);
        });
        return unsub;
    }, []);

    const approveUser = async (email: string) => {
        try {
            const userRef = doc(db, 'users', email);
            await updateDoc(userRef, { is_approved: 1 });
        } catch (error) {
            console.error("Approve error:", error);
            alert('เกิดข้อผิดพลาดในการอนุมัติสิทธิ์');
        }
    };

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const pendingCount = users.filter(u => u.is_approved === 0).length;
    const approvedCount = users.filter(u => u.is_approved === 1).length;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center">
                    <ShieldCheck className="mr-3 text-emerald-500" size={32} />
                    จัดการสิทธิ์ผู้ใช้งาน
                </h1>
                <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-widest">
                    ADMIN ACCESS CONTROL (FIRESTORE)
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาอีเมล..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl">
                        <UserCheck size={18} className="text-emerald-500" /> อนุมัติแล้ว: {approvedCount}
                        <span className="mx-2 text-slate-300">|</span>
                        <UserX size={18} className="text-amber-500" /> รออนุมัติ: {pendingCount}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                            <AlertCircle size={48} className="text-slate-200 mb-4" />
                            <p className="font-bold">ไม่พบผู้ใช้งาน</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-sm tracking-widest lowercase">
                                    <th className="p-4 pl-6">Email</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-slate-700">
                                            {u.email}
                                        </td>
                                        <td className="p-4">
                                            {u.is_approved === 1 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {u.email === 'watchawin.tha@gmail.com' ? (
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Super Admin</span>
                                            ) : u.is_approved === 1 ? (
                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg">✓ อนุมัติถาวร</span>
                                            ) : (
                                                <button
                                                    onClick={() => approveUser(u.email)}
                                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                >
                                                    อนุมัติการเข้าถึง
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
