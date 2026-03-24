import * as XLSX from 'xlsx';

export function exportToExcel(data: {
    students: any[];
    teachers: any[];
    rooms: any[];
    courses: any[];
    enrollments: any[];
    schedules: any[];
    payments: any[];
    expenses: any[];
    attendances: any[];
}) {
    const wb = XLSX.utils.book_new();

    // ---- Sheet: นักเรียน ----
    const studentsData = data.students.map(s => ({
        'รหัส': s.id,
        'ชื่อ': s.name,
        'ชื่อเล่น': s.nickname || '',
        'ระดับชั้น': s.grade || '',
        'เบอร์โทรผู้ปกครอง': s.parentTel || ''
    }));
    if (studentsData.length === 0) studentsData.push({ 'รหัส': '', 'ชื่อ': '', 'ชื่อเล่น': '', 'ระดับชั้น': '', 'เบอร์โทรผู้ปกครอง': '' });
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'นักเรียน');

    // ---- Sheet: ครู ----
    const teachersData = data.teachers.map(t => ({ 'รหัส': t.id, 'ชื่อครู': t.name }));
    if (teachersData.length === 0) teachersData.push({ 'รหัส': '', 'ชื่อครู': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teachersData), 'ครู');

    // ---- Sheet: ห้องเรียน ----
    const roomsData = data.rooms.map(r => ({ 'รหัส': r.id, 'ชื่อห้อง': r.name }));
    if (roomsData.length === 0) roomsData.push({ 'รหัส': '', 'ชื่อห้อง': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomsData), 'ห้องเรียน');

    // ---- Sheet: คอร์ส ----
    const coursesData = data.courses.map(c => ({
        'รหัส': c.id,
        'ชื่อคอร์ส': c.name,
        'ราคา (บาท)': c.price,
        'จำนวนชั่วโมงทั้งหมด': c.totalSessions
    }));
    if (coursesData.length === 0) coursesData.push({ 'รหัส': '', 'ชื่อคอร์ส': '', 'ราคา (บาท)': '', 'จำนวนชั่วโมงทั้งหมด': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(coursesData), 'คอร์ส');

    // ---- Sheet: ตารางเรียน ----
    const schedulesData = data.schedules.map(s => ({
        'รหัสคอร์ส': s.courseId,
        'วัน': s.day,
        'เริ่ม': s.start,
        'สิ้นสุด': s.end,
        'ห้อง': s.room || '',
        'ครูผู้สอน': s.teacher || ''
    }));
    if (schedulesData.length === 0) schedulesData.push({ 'รหัสคอร์ส': '', 'วัน': '', 'เริ่ม': '', 'สิ้นสุด': '', 'ห้อง': '', 'ครูผู้สอน': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(schedulesData), 'ตารางเรียน');

    // ---- Sheet: การลงทะเบียน ----
    const enrollmentsData = data.enrollments.map(e => ({
        'รหัส': e.id,
        'รหัสนักเรียน': e.studentId,
        'รหัสคอร์ส': e.courseId,
        'ชั่วโมงคงเหลือ': e.remainingHours,
        'ชั่วโมงทั้งหมด': e.totalHours,
        'ชำระแล้ว': e.paid ? 'ใช่' : 'ไม่',
        'ค้างชำระ (บาท)': e.balance || 0,
        'วันที่': e.date || ''
    }));
    if (enrollmentsData.length === 0) enrollmentsData.push({ 'รหัส': '', 'รหัสนักเรียน': '', 'รหัสคอร์ส': '', 'ชั่วโมงคงเหลือ': '', 'ชั่วโมงทั้งหมด': '', 'ชำระแล้ว': '', 'ค้างชำระ (บาท)': '', 'วันที่': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(enrollmentsData), 'การลงทะเบียน');

    // ---- Sheet: ประวัติการชำระเงิน ----
    const paymentsData = data.payments.map(p => ({
        'รหัส': p.id,
        'ชื่อนักเรียน': p.studentName || '',
        'คอร์ส': p.course || '',
        'จำนวนเงิน (บาท)': p.amount,
        'ประเภท': p.type || '',
        'วันที่': p.date || ''
    }));
    if (paymentsData.length === 0) paymentsData.push({ 'รหัส': '', 'ชื่อนักเรียน': '', 'คอร์ส': '', 'จำนวนเงิน (บาท)': '', 'ประเภท': '', 'วันที่': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentsData), 'ประวัติการชำระเงิน');

    // ---- Sheet: รายจ่าย ----
    const expensesData = data.expenses.map(e => ({
        'รหัส': e.id,
        'รายการ': e.name || '',
        'จำนวนเงิน (บาท)': e.amount,
        'ประเภท': e.type || '',
        'วันที่': e.date || ''
    }));
    if (expensesData.length === 0) expensesData.push({ 'รหัส': '', 'รายการ': '', 'จำนวนเงิน (บาท)': '', 'ประเภท': '', 'วันที่': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), 'รายจ่าย');

    // ---- Sheet: การเช็คชื่อ ----
    const attendancesData = data.attendances.map(a => ({
        'รหัส': a.id,
        'รหัสนักเรียน': a.studentId,
        'รหัสคอร์ส': a.courseId,
        'วันที่': a.date || ''
    }));
    if (attendancesData.length === 0) attendancesData.push({ 'รหัส': '', 'รหัสนักเรียน': '', 'รหัสคอร์ส': '', 'วันที่': '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendancesData), 'การเช็คชื่อ');

    // Write file
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    XLSX.writeFile(wb, `TutorM_สำรองข้อมูล_${dateStr}.xlsx`);
}

export async function importFromExcel(
    file: File,
    saveData: (table: string, data: any, action?: 'upsert' | 'delete') => Promise<any>
): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });

                const sheetMap: Record<string, string> = {
                    'นักเรียน': 'students',
                    'ครู': 'teachers',
                    'ห้องเรียน': 'rooms',
                    'คอร์ส': 'courses',
                    'ตารางเรียน': 'schedules',
                    'การลงทะเบียน': 'enrollments',
                    'ประวัติการชำระเงิน': 'payments',
                    'รายจ่าย': 'expenses',
                    'การเช็คชื่อ': 'attendances'
                };

                const fieldMap: Record<string, Record<string, string>> = {
                    'students': { 'รหัส': 'id', 'ชื่อ': 'name', 'ชื่อเล่น': 'nickname', 'ระดับชั้น': 'grade', 'เบอร์โทรผู้ปกครอง': 'parentTel' },
                    'teachers': { 'รหัส': 'id', 'ชื่อครู': 'name' },
                    'rooms': { 'รหัส': 'id', 'ชื่อห้อง': 'name' },
                    'courses': { 'รหัส': 'id', 'ชื่อคอร์ส': 'name', 'ราคา (บาท)': 'price', 'จำนวนชั่วโมงทั้งหมด': 'totalSessions' },
                    'schedules': { 'รหัสคอร์ส': 'courseId', 'วัน': 'day', 'เริ่ม': 'start', 'สิ้นสุด': 'end', 'ห้อง': 'room', 'ครูผู้สอน': 'teacher' },
                    'enrollments': { 'รหัส': 'id', 'รหัสนักเรียน': 'studentId', 'รหัสคอร์ส': 'courseId', 'ชั่วโมงคงเหลือ': 'remainingHours', 'ชั่วโมงทั้งหมด': 'totalHours', 'ชำระแล้ว': 'paid', 'ค้างชำระ (บาท)': 'balance', 'วันที่': 'date' },
                    'payments': { 'รหัส': 'id', 'ชื่อนักเรียน': 'studentName', 'คอร์ส': 'course', 'จำนวนเงิน (บาท)': 'amount', 'ประเภท': 'type', 'วันที่': 'date' },
                    'expenses': { 'รหัส': 'id', 'รายการ': 'name', 'จำนวนเงิน (บาท)': 'amount', 'ประเภท': 'type', 'วันที่': 'date' },
                    'attendances': { 'รหัส': 'id', 'รหัสนักเรียน': 'studentId', 'รหัสคอร์ส': 'courseId', 'วันที่': 'date' }
                };

                let totalRows = 0;
                for (const sheetName of wb.SheetNames) {
                    const table = sheetMap[sheetName];
                    if (!table) continue;
                    const ws = wb.Sheets[sheetName];
                    const rows: any[] = XLSX.utils.sheet_to_json(ws);
                    const fMap = fieldMap[table];
                    for (const row of rows) {
                        const mapped: any = {};
                        for (const [thaiKey, engKey] of Object.entries(fMap)) {
                            if (row[thaiKey] !== undefined && row[thaiKey] !== '') {
                                mapped[engKey] = row[thaiKey];
                            }
                        }
                        if (Object.keys(mapped).length <= 1) continue; // skip empty rows
                        if (mapped.paid === 'ใช่') mapped.paid = 1;
                        if (mapped.paid === 'ไม่') mapped.paid = 0;
                        await saveData(table, mapped, 'upsert');
                        totalRows++;
                    }
                }
                resolve({ success: true, message: `นำเข้าข้อมูลสำเร็จ ${totalRows} รายการ` });
            } catch (err) {
                resolve({ success: false, message: 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel' });
            }
        };
        reader.readAsArrayBuffer(file);
    });
}
