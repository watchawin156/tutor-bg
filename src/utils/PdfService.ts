import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const FONT_URL = '/THSarabunNew.ttf';
const FONT_BOLD_URL = '/THSarabunNewBold.ttf';

export class PdfService {
    private static fontCache: Map<string, ArrayBuffer> = new Map();

    private static async loadFont(url: string) {
        if (this.fontCache.has(url)) return this.fontCache.get(url)!;
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        this.fontCache.set(url, buffer);
        return buffer;
    }

    static async generateFinanceReport(data: {
        monthName: string;
        totalRev: number;
        totalExp: number;
        teachers: any[];
        ratios: any;
        expenses: any[];
        payments: any[];
    }, targetWindow?: Window | null) {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = await this.loadFont(FONT_URL);
        const fontBoldBytes = await this.loadFont(FONT_BOLD_URL);

        const customFont = await pdfDoc.embedFont(fontBytes);
        const customFontBold = await pdfDoc.embedFont(fontBoldBytes);

        let page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();
        let y = height - 50;

        // Header
        page.drawText(`รายงานสรุปการเงิน (เดือน${data.monthName})`, {
            x: 50,
            y,
            size: 24,
            font: customFontBold,
            color: rgb(0.02, 0.44, 0.33),
        });
        y -= 40;

        page.drawLine({
            start: { x: 50, y },
            end: { x: width - 50, y },
            thickness: 2,
            color: rgb(0.02, 0.44, 0.33),
        });
        y -= 30;

        // Summary Box
        page.drawRectangle({
            x: 50,
            y: y - 60,
            width: width - 100,
            height: 70,
            color: rgb(0.95, 0.98, 0.96),
            borderColor: rgb(0.8, 0.9, 0.85),
            borderWidth: 1,
        });

        const summaryY = y - 20;
        page.drawText('รายรับรวม', { x: 70, y: summaryY, size: 12, font: customFontBold, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`฿${data.totalRev.toLocaleString()}`, { x: 70, y: summaryY - 20, size: 18, font: customFontBold });

        page.drawText('รายจ่ายรวม', { x: 230, y: summaryY, size: 12, font: customFontBold, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`฿${data.totalExp.toLocaleString()}`, { x: 230, y: summaryY - 20, size: 18, font: customFontBold, color: rgb(0.8, 0.2, 0.2) });

        const netProfit = data.totalRev - data.totalExp;
        page.drawText('คงเหลือสุทธิ (กำไร)', { x: 380, y: summaryY, size: 12, font: customFontBold, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(`฿${netProfit.toLocaleString()}`, { x: 380, y: summaryY - 20, size: 18, font: customFontBold, color: netProfit >= 0 ? rgb(0.02, 0.44, 0.33) : rgb(0.8, 0.2, 0.2) });

        y -= 100;

        // Teacher Salaries - UPDATED: Calculation based on Net Profit
        page.drawText('ส่วนแบ่งเงินเดือนครู (คิดจากกำไรสุทธิ)', { x: 50, y, size: 16, font: customFontBold });
        y -= 25;
        page.drawText(`* คำนวณจากยอดคงเหลือ ฿${netProfit.toLocaleString()} (รายรับ - รายจ่าย)`, { x: 50, y, size: 10, font: customFont, color: rgb(0.5, 0.5, 0.5) });
        y -= 20;

        // Table Header
        page.drawRectangle({ x: 50, y: y - 20, width: width - 100, height: 20, color: rgb(0.9, 0.9, 0.9) });
        page.drawText('ชื่อครูผู้สอน', { x: 60, y: y - 15, size: 10, font: customFontBold });
        page.drawText('สัดส่วน (%)', { x: 300, y: y - 15, size: 10, font: customFontBold });
        page.drawText('ยอดเงิน (กำไร * %)', { x: 450, y: y - 15, size: 10, font: customFontBold });
        y -= 20;

        data.teachers.forEach(t => {
            const ratio = data.ratios[t.name] || 0;
            if (ratio > 0) {
                const salary = Math.max(0, netProfit * (ratio / 100));
                page.drawText(t.name, { x: 60, y: y - 15, size: 10, font: customFont });
                page.drawText(`${ratio}%`, { x: 300, y: y - 15, size: 10, font: customFont });
                page.drawText(`฿${salary.toLocaleString()}`, { x: 450, y: y - 15, size: 10, font: customFontBold });
                y -= 20;
            }
        });

        y -= 30;

        // รายงานสรุปบัญชีรายรับ-รายจ่าย (Unified Ledger)
        if (y < 200) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
        page.drawText('รายงานสรุปบัญชีรายรับ-รายจ่าย', { x: 50, y, size: 16, font: customFontBold });
        y -= 20;

        // Table Header
        page.drawRectangle({ x: 50, y: y - 20, width: width - 100, height: 20, color: rgb(0.95, 0.95, 0.95) });
        page.drawText('วันที่', { x: 60, y: y - 15, size: 10, font: customFontBold });
        page.drawText('รายการ (Description)', { x: 130, y: y - 15, size: 10, font: customFontBold });
        page.drawText('รายรับ', { x: 400, y: y - 15, size: 10, font: customFontBold });
        page.drawText('รายจ่าย', { x: 480, y: y - 15, size: 10, font: customFontBold });
        y -= 25;

        // Merge and Sort
        const allTransactions = [
            ...data.payments.map(p => ({ dateStr: p.date, desc: `รับ: น้อง${p.studentName} (${p.course})`, inc: p.amount, exp: 0, ts: p.timestamp })),
            ...data.expenses.map(e => ({ dateStr: e.date, desc: `จ่าย: ${e.name}`, inc: 0, exp: e.amount, ts: e.timestamp }))
        ].sort((a, b) => (a.ts || 0) - (b.ts || 0));

        if (allTransactions.length === 0) {
            page.drawText('ไม่มีรายการเคลื่อนไหว', { x: width / 2 - 40, y: y - 15, size: 10, font: customFont });
        } else {
            allTransactions.forEach(item => {
                if (y < 80) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
                page.drawText(item.dateStr || '-', { x: 60, y: y - 15, size: 10, font: customFont });

                // Item Name - Left Aligned
                page.drawText(item.desc, { x: 130, y: y - 15, size: 10, font: customFont });

                if (item.inc > 0) page.drawText(item.inc.toLocaleString(), { x: 400, y: y - 15, size: 10, font: customFontBold, color: rgb(0.02, 0.44, 0.33) });
                if (item.exp > 0) page.drawText(item.exp.toLocaleString(), { x: 480, y: y - 15, size: 10, font: customFontBold, color: rgb(0.8, 0.2, 0.2) });

                y -= 20;
                page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.2, color: rgb(0.9, 0.9, 0.9) });
                y -= 5;
            });
        }

        const pdfBytes = await pdfDoc.save();
        this.openPdf(pdfBytes, targetWindow);
    }

    static async generateTimetableReport(data: {
        schedules: any[];
        courses: any[];
        days_th: any;
    }, targetWindow?: Window | null) {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = await this.loadFont(FONT_URL);
        const fontBoldBytes = await this.loadFont(FONT_BOLD_URL);

        const customFont = await pdfDoc.embedFont(fontBytes);
        const customFontBold = await pdfDoc.embedFont(fontBoldBytes);

        const page = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
        const { width, height } = page.getSize();
        let y = height - 50;

        page.drawText('ตารางเรียนประจำสัปดาห์', { x: 50, y, size: 24, font: customFontBold, color: rgb(0.02, 0.44, 0.33) });
        y -= 40;

        const uniqueTimes = [...new Set(data.schedules.map(s => `${s.start}-${s.end}`))].sort();
        const colWidth = (width - 150) / uniqueTimes.length;
        const startX = 50;

        // Table Header
        page.drawRectangle({ x: startX, y: y - 25, width: width - 100, height: 25, color: rgb(0.9, 0.9, 0.9) });
        page.drawText('วัน \\ เวลา', { x: startX + 10, y: y - 18, size: 10, font: customFontBold });
        uniqueTimes.forEach((time, i) => {
            page.drawText(time, { x: startX + 100 + (i * colWidth), y: y - 18, size: 10, font: customFontBold });
        });
        y -= 25;

        Object.keys(data.days_th).forEach(dayKey => {
            const daySchedules = data.schedules.filter(s => s.day === dayKey);
            if (daySchedules.length === 0) return;

            page.drawText(data.days_th[dayKey], { x: startX + 10, y: y - 25, size: 10, font: customFontBold });
            uniqueTimes.forEach((time, i) => {
                const sch = daySchedules.find(s => `${s.start}-${s.end}` === time);
                if (sch) {
                    const course = data.courses.find(c => c.id === sch.courseId);
                    page.drawText(course?.name || '-', { x: startX + 100 + (i * colWidth), y: y - 20, size: 9, font: customFont });
                    page.drawText(`ครู${sch.teacher}`, { x: startX + 100 + (i * colWidth), y: y - 32, size: 8, font: customFont, color: rgb(0.4, 0.4, 0.4) });
                }
            });
            y -= 40;
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.2, color: rgb(0.8, 0.8, 0.8) });
        });

        const pdfBytes = await pdfDoc.save();
        this.openPdf(pdfBytes, targetWindow);
    }

    private static openPdf(pdfBytes: Uint8Array, targetWindow?: Window | null) {
        const blob = new Blob([pdfBytes.buffer] as any[], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (targetWindow) {
            targetWindow.location.href = url;
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => { document.body.removeChild(link); }, 100);
        }

        setTimeout(() => { URL.revokeObjectURL(url); }, 5000);
    }
}
