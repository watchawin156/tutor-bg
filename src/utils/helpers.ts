export const DAYS_TH = {
    Monday: 'จันทร์',
    Tuesday: 'อังคาร',
    Wednesday: 'พุธ',
    Thursday: 'พฤหัสบดี',
    Friday: 'ศุกร์',
    Saturday: 'เสาร์',
    Sunday: 'อาทิตย์'
};

export const MONTHS_TH = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const formatThaiDate = (date: Date | number | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
};

export const getPercentColor = (rem: number, total: number) => {
    if (!total) return 'text-slate-600 bg-slate-100 border-slate-200';
    const p = (rem / total) * 100;
    if (p === 0) return 'text-red-600 bg-red-100 border-red-200';
    if (p <= 25) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (p <= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-emerald-600 bg-emerald-100 border-emerald-200';
};

export const parseTimeInput = (val: string) => {
    if (!val) return null;
    const parts = val.trim().split(/\s*-\s*|\s+/);
    if (parts.length !== 2) return null;
    const format = (t: string) => {
        let [h, m] = t.replace('.', ':').split(':');
        if (!m) m = '00';
        return `${h.padStart(2, '0')}:${m.padEnd(2, '0')}`;
    };
    return `${format(parts[0])}-${format(parts[1])}`;
};
