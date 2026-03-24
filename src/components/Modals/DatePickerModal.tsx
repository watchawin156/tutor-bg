import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { MONTHS_TH } from '../../utils/helpers';

interface DatePickerModalProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    onClose: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ value, onChange, onClose }) => {
    const initialDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const yearBE = viewDate.getFullYear() + 543;
    const monthName = MONTHS_TH[viewDate.getMonth()];

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);
        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
        const dd = String(newDate.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        onClose();
    };

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
        const isSelected = selectedDate.toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();

        days.push(
            <button
                key={d}
                onClick={() => handleDateSelect(d)}
                className={`h-10 w-full flex items-center justify-center rounded-xl font-bold transition-all ${isSelected
                        ? 'bg-emerald-700 text-white shadow-md scale-110 z-10'
                        : isToday
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                {d}
            </button>
        );
    }

    const changeMonth = (offset: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-700 p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon size={20} className="opacity-80" />
                            <span className="font-black text-lg tracking-tight uppercase">เลือกวันที่</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="text-3xl font-black">{selectedDate.getDate()} {MONTHS_TH[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}</div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-emerald-700">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="text-center">
                            <div className="text-lg font-black text-slate-800 tracking-tight">{monthName}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{yearBE}</div>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-emerald-700">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 font-black rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatePickerModal;
