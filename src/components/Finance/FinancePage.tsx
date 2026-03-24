import React from 'react';
import { DollarSign, Plus, Settings2, Trash2, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { MONTHS_TH, formatThaiDate } from '../../utils/helpers';

const FinancePage = ({
    totalRevMonth, totalExpMonth,
    selectedMonth, setSelectedMonth,
    currentMonthPayments, currentMonthExpenses,
    getStudentInfo, getCourseInfo,
    setModalType, setFormData,
    deletePayment, deleteExpense,
    swipedId, setSwipedId
}: any) => {
    const handleTouchStart = (e: React.TouchEvent, id: any) => {
        (window as any).touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent, id: any) => {
        const touchX = e.touches[0].clientX;
        const diff = (window as any).touchStartX - touchX;
        if (diff > 50) setSwipedId(id);
        else if (diff < -50) setSwipedId(null);
    };

    const netProfit = totalRevMonth - totalExpMonth;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">สรุปการเงิน</h2>
                    <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Revenue & Expenses Overview</p>
                </div>
                <div className="flex w-full md:w-auto space-x-2">
                    <select
                        className="flex-1 md:flex-none text-[15px] font-black text-slate-700 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm outline-none cursor-pointer hover:border-emerald-500 transition-all"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                    >
                        {MONTHS_TH.map((m, i) => <option key={i} value={i}>เดือน{m}</option>)}
                    </select>
                    <button
                        onClick={() => setModalType('addExpense')}
                        className="flex-1 md:flex-none justify-center bg-red-600 text-white px-6 py-3 rounded-2xl text-[14px] font-black shadow-lg shadow-red-100 active:scale-95 hover:bg-red-700 transition-all flex items-center"
                    >
                        <Plus size={18} className="mr-1" /> รายจ่าย
                    </button>
                </div>
            </div>

            {/* Income & Expense Cards - Side by Side on Mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-6">
                <div className="bg-emerald-700 p-4 md:p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden flex flex-col justify-center">
                    <div className="mb-1 flex items-center bg-white/10 w-fit px-2 py-0.5 rounded-lg">
                        <TrendingUp size={12} className="mr-1 text-emerald-300" />
                        <span className="text-[10px] md:text-[12px] font-black text-emerald-100 uppercase tracking-widest">รายรับ</span>
                    </div>
                    <h3 className="text-xl md:text-5xl font-black mt-1 md:mt-2 relative z-10 tracking-tight leading-none">฿{totalRevMonth.toLocaleString()}</h3>
                    <DollarSign size={80} className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 opacity-10 rotate-12" />
                </div>
                <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="mb-1 flex items-center bg-red-50 w-fit px-2 py-0.5 rounded-lg border border-red-100">
                        <TrendingDown size={12} className="mr-1 text-red-500" />
                        <span className="text-[10px] md:text-[12px] font-black text-red-400 uppercase tracking-widest">รายจ่าย</span>
                    </div>
                    <h3 className="text-xl md:text-5xl font-black mt-1 md:mt-2 text-red-600 relative z-10 tracking-tight leading-none">฿{totalExpMonth.toLocaleString()}</h3>
                </div>
            </div>

            {/* Net Profit Card - Full Width */}
            <div className={`mb-8 p-6 rounded-[2rem] border-2 border-dashed flex items-center justify-between ${netProfit >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">กำไรสุทธิเดือนนี้</p>
                    <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>฿{netProfit.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <DollarSign size={24} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                    <h4 className="text-[17px] font-black text-slate-800 tracking-tight">ประวัติธุรกรรมเดือนนี้</h4>
                </div>

                {currentMonthPayments.length === 0 && currentMonthExpenses.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <DollarSign size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 font-bold">ยังไม่มีรายการรับ-จ่ายในเดือนนี้</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50" onClick={() => setSwipedId(null)}>
                        {currentMonthPayments.map((p: any) => {
                            const isSwiped = swipedId === `p-${p.id}`;
                            return (
                                <div key={`p-${p.id}`} className="relative overflow-hidden group">
                                    <div
                                        onTouchStart={(e) => handleTouchStart(e, `p-${p.id}`)}
                                        onTouchMove={(e) => handleTouchMove(e, `p-${p.id}`)}
                                        className={`flex justify-between items-center px-6 py-5 bg-white transition-transform duration-300 ${isSwiped ? '-translate-x-32' : ''}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 shrink-0 border border-emerald-100"><Plus size={20} strokeWidth={3} /></div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] md:text-[17px] font-black text-slate-800 truncate">น้อง{p.studentName} <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-1 hidden md:inline-block uppercase tracking-tighter">{p.course}</span></p>
                                                <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center uppercase tracking-widest">{formatThaiDate(p.timestamp || p.date)} • {p.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[16px] md:text-[19px] font-black text-emerald-700 tracking-tight">+ ฿{p.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`absolute right-0 top-0 bottom-0 flex transition-transform duration-300 ${isSwiped ? 'translate-x-0' : 'translate-x-full'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(p); setModalType('addPayment'); setSwipedId(null); }} className="bg-slate-100 text-slate-600 px-5 flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-widest"><Settings2 size={18} className="mb-1" /> แก้</button>
                                        <button onClick={(e) => { e.stopPropagation(); deletePayment(p.id); }} className="bg-red-500 text-white px-5 flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-widest"><Trash2 size={18} className="mb-1" /> ลบ</button>
                                    </div>
                                    <button onClick={() => setSwipedId(isSwiped ? null : `p-${p.id}`)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 md:hidden"><ChevronRight size={18} /></button>
                                </div>
                            );
                        })}

                        {currentMonthExpenses.map((e: any) => {
                            const isSwiped = swipedId === `e-${e.id}`;
                            return (
                                <div key={`e-${e.id}`} className="relative overflow-hidden group">
                                    <div
                                        onTouchStart={(ev) => handleTouchStart(ev, `e-${e.id}`)}
                                        onTouchMove={(ev) => handleTouchMove(ev, `e-${e.id}`)}
                                        className={`flex justify-between items-center px-6 py-5 bg-white transition-transform duration-300 ${isSwiped ? '-translate-x-32' : ''}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mr-4 shrink-0 border border-red-100"><DollarSign size={20} strokeWidth={3} /></div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] md:text-[17px] font-black text-slate-800 truncate">{e.name}</p>
                                                <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center uppercase tracking-widest">{formatThaiDate(e.timestamp || e.date)} • {e.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[16px] md:text-[19px] font-black text-red-600 tracking-tight">- ฿{e.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`absolute right-0 top-0 bottom-0 flex transition-transform duration-300 ${isSwiped ? 'translate-x-0' : 'translate-x-full'}`}>
                                        <button onClick={(ev) => { ev.stopPropagation(); setFormData({ ...e, expenseName: e.name }); setModalType('addExpense'); setSwipedId(null); }} className="bg-slate-100 text-slate-600 px-5 flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-widest"><Settings2 size={18} className="mb-1" /> แก้</button>
                                        <button onClick={(ev) => { ev.stopPropagation(); deleteExpense(e.id); }} className="bg-red-500 text-white px-5 flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-widest"><Trash2 size={18} className="mb-1" /> ลบ</button>
                                    </div>
                                    <button onClick={() => setSwipedId(isSwiped ? null : `e-${e.id}`)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 md:hidden"><ChevronRight size={18} /></button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancePage;
