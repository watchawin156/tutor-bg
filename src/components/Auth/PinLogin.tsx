import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight } from 'lucide-react';

interface PinLoginProps {
    onUnlock: (pin: string) => void;
    correctPin: string;
    logo: string;
}

const PinLogin: React.FC<PinLoginProps> = ({ onUnlock, correctPin, logo }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleNumber = (num: string) => {
        if (input.length < 6) {
            const newValue = input + num;
            setInput(newValue);
            setError(false);
            if (newValue.length === 6) {
                if (newValue === correctPin) {
                    onUnlock(newValue);
                } else {
                    setError(true);
                    setTimeout(() => setInput(''), 500);
                }
            }
        }
    };

    const handleDelete = () => setInput(input.slice(0, -1));

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-slate-100 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
                    <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                </div>

                <h1 className="text-2xl font-black text-slate-800 mb-1">ยินดีต้อนรับ</h1>
                <p className="text-slate-500 font-bold mb-8 text-sm uppercase tracking-widest">กรุณาใส่รหัสผ่านเพื่อเข้าใช้งาน</p>

                <div className="flex justify-center space-x-3 mb-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${i < input.length ? 'bg-emerald-600 border-emerald-600 scale-110' : error ? 'border-red-400 animate-shake' : 'border-slate-300'}`}></div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleNumber(num.toString())} className="h-16 w-16 bg-slate-50 rounded-2xl text-xl font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90 transition-all shadow-sm">{num}</button>
                    ))}
                    <button onClick={() => setInput('')} className="h-16 w-16 bg-slate-50 rounded-2xl text-xs font-black text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all shadow-sm">ล้าง</button>
                    <button onClick={() => handleNumber('0')} className="h-16 w-16 bg-slate-50 rounded-2xl text-xl font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 active:scale-90 transition-all shadow-sm">0</button>
                    <button onClick={handleDelete} className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 active:scale-90 transition-all shadow-sm"><ArrowRight className="rotate-180" size={20} /></button>
                </div>

                {error && <p className="text-red-500 text-xs font-bold mt-6 animate-pulse">รหัสผ่านไม่ถูกต้อง!</p>}
            </div>
        </div>
    );
};

export default PinLogin;
