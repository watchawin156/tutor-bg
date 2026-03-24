import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Users, BookOpen, DollarSign, History,
    GraduationCap, Menu, X, FileText, Calendar,
    UserPlus, Edit3, Plus, Settings2, Trash2,
    CheckCircle, AlertTriangle, Clock, ChevronRight,
    Search, Phone, ArrowLeft, Printer,
    LogOut, ShieldCheck, User as UserIcon
} from 'lucide-react';
import { MONTHS_TH, DAYS_TH, parseTimeInput } from './utils/helpers';

// Components
import StudentsPage from './components/Students/StudentsPage';
import ClassesPage from './components/Classes/ClassesPage';
import FinancePage from './components/Finance/FinancePage';
import HistoryPage from './components/History/HistoryPage';
import ManageBasicsModal from './components/Modals/ManageBasicsModal';
import AttendanceModal from './components/Modals/AttendanceModal';
import FormsModal from './components/Modals/FormsModal';
import AdminPage from './components/Admin/AdminPage';
import { PdfService } from './utils/PdfService';
import { exportToExcel, importFromExcel } from './utils/ExcelService';
import GoogleLogin from './components/Auth/GoogleLogin';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
    collection, doc, setDoc, addDoc, deleteDoc,
    onSnapshot, query, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';

const formatThaiDate = (date: Date | number) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
};

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('students');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [printMode, setPrintMode] = useState<string | null>(null);

    const isAdmin = user?.email === 'watchawin.tha@gmail.com';

    // Global States
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'error' | null>(null);

    // Dynamic Navigation Items
    const NAV_ITEMS = [
        { id: 'students', icon: Users, label: 'ทะเบียนนักเรียน' },
        { id: 'classes', icon: BookOpen, label: 'ตาราง/คอร์ส' },
        { id: 'finance', icon: DollarSign, label: 'การเงิน' },
        { id: 'history', icon: History, label: 'ประวัติ' },
    ];
    if (isAdmin) {
        NAV_ITEMS.push({ id: 'admin', icon: ShieldCheck, label: 'จัดการสิทธิ์' });
    }

    // --- FIRESTORE PERSISTENCE LOGIC ---
    const saveData = async (tableName: string, data: any, action: 'upsert' | 'delete' = 'upsert') => {
        try {
            const cleanData = { ...data };
            const id = cleanData.id;

            if (action === 'delete') {
                if (id) await deleteDoc(doc(db, tableName, String(id)));
                return;
            }

            if (id) {
                // Update existing
                const docRef = doc(db, tableName, String(id));
                await setDoc(docRef, cleanData, { merge: true });
                return id;
            } else {
                // Create new
                const colRef = collection(db, tableName);
                const docRef = await addDoc(colRef, cleanData);
                // Sync the Firestore ID back into the document for consistency with app logic
                await updateDoc(docRef, { id: docRef.id });
                return docRef.id;
            }
        } catch (err) {
            console.error(`Firestore Save Error (${tableName}):`, err);
            throw err;
        }
    };

    // 1. Monitor Auth & User Approval
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (!u) {
                setAuthLoading(false);
                setIsApproved(null);
                setStudents([]); setTeachers([]); setRooms([]); setCourses([]);
                setEnrollments([]); setSchedules([]); setPayments([]); setExpenses([]); setAttendances([]);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.email!);
        const unsub = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
                setIsApproved(snap.data().is_approved === 1 || isAdmin);
            } else {
                // Register new user record for approval
                setDoc(userDocRef, { email: user.email, is_approved: 0 });
                setIsApproved(isAdmin);
            }
            setAuthLoading(false);
        });
        return unsub;
    }, [user, isAdmin]);

    // 2. Real-time Listeners for all collections
    useEffect(() => {
        if (!user || isApproved !== true) return;

        setSyncStatus('syncing');
        const collections = [
            { name: 'students', setter: setStudents },
            { name: 'teachers', setter: setTeachers },
            { name: 'rooms', setter: setRooms },
            { name: 'courses', setter: setCourses },
            { name: 'enrollments', setter: setEnrollments },
            { name: 'schedules', setter: setSchedules },
            { name: 'payments', setter: setPayments },
            { name: 'expenses', setter: setExpenses },
            { name: 'attendances', setter: setAttendances },
        ];

        const unsubs = collections.map(col =>
            onSnapshot(collection(db, col.name), (snap) => {
                const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                col.setter(data);
                if (col.name === 'students') setSyncStatus('live');
            }, (err) => {
                console.error(`Sync error (${col.name}):`, err);
                setSyncStatus('error');
            })
        );

        return () => unsubs.forEach(u => u());
    }, [user, isApproved]);

    // UI States
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [modalType, setModalType] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [selectedTeacher, setSelectedTeacher] = useState('ทั้งหมด');
    const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [swipedId, setSwipedId] = useState<number | null>(null);

    // Excel Export/Import
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleExcelClick = (e: React.MouseEvent) => {
        if (e.shiftKey) {
            // Shift+Click = Import
            excelInputRef.current?.click();
        } else {
            // Normal Click = Export
            exportToExcel({ students, teachers, rooms, courses, enrollments, schedules, payments, expenses, attendances });
        }
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const result = await importFromExcel(file, saveData);
        alert(result.message);
        e.target.value = '';
    };


    // Helpers
    const getStudentInfo = (id: string | number) => students.find((s: any) => s.id === id) || { name: 'ไม่ทราบชื่อ', nickname: '?', parentTel: '-' };
    const getCourseInfo = (id: string | number) => courses.find((c: any) => c.id === id) || { name: 'คอร์สถูกลบ', totalSessions: 0, price: 0 };
    const teachersList = useMemo(() => ['ทั้งหมด', ...teachers.map((t: any) => t.name)], [teachers]);

    const currentMonthPayments = useMemo(() => payments.filter((p: any) => new Date(p.timestamp).getMonth() === selectedMonth), [payments, selectedMonth]);
    const currentMonthExpenses = useMemo(() => expenses.filter((e: any) => new Date(e.timestamp).getMonth() === selectedMonth), [expenses, selectedMonth]);
    const totalRevMonth = currentMonthPayments.reduce((s: number, p: any) => s + p.amount, 0);
    const totalExpMonth = currentMonthExpenses.reduce((s: number, e: any) => s + e.amount, 0);

    const deleteCourse = async (c: any) => {
        const input = window.prompt(`พิมพ์คำว่า "ยืนยัน" เพื่อลบ วิชา ${c.name}`);
        if (input === 'ยืนยัน') {
            await saveData('courses', c, 'delete');
            setCourses((prev: any) => prev.filter((course: any) => course.id !== c.id));
            setSchedules((prev: any) => prev.filter((s: any) => s.courseId !== c.id));
        }
    };

    const openEditCourse = (course: any) => {
        const courseSchedules = schedules.filter((s: any) => s.courseId === course.id).map((s: any) => ({
            day: s.day, time: `${s.start}-${s.end}`, room: s.room, teacher: s.teacher
        }));
        setFormData({
            ...course,
            schedulesList: courseSchedules.length > 0 ? courseSchedules : [{ day: '', time: '', room: '', teacher: '' }]
        });
        setModalType('editCourse');
    };

    const deductHour = async (studentId: number, courseId: number) => {
        if (!checkDate) return alert('เลือกวันที่เช็คชื่อด้วย');
        if (attendances.some((a: any) => a.studentId === studentId && a.courseId === courseId && a.date === checkDate)) {
            return alert(`วันนี้เช็คชื่อไปแล้ว!`);
        }
        const attData = { studentId, courseId, date: checkDate, timestamp: Date.now() };
        const attId = await saveData('attendances', attData);
        setAttendances([...attendances, { ...attData, id: attId }]);

        const enr = enrollments.find((e: any) => e.studentId === studentId && e.courseId === courseId);
        if (enr) {
            const updatedEnr = { ...enr, remainingHours: Math.max(0, enr.remainingHours - 1) };
            await saveData('enrollments', updatedEnr);
            setEnrollments(prev => prev.map(e => e.id === enr.id ? updatedEnr : e));
        }
    };

    const undoAttendance = async (studentId: number, courseId: number) => {
        const att = attendances.find((a: any) => a.studentId === studentId && a.courseId === courseId && a.date === checkDate);
        if (att) {
            await saveData('attendances', att, 'delete');
            setAttendances((prev: any) => prev.filter((a: any) => a.id !== att.id));

            const enr = enrollments.find((e: any) => e.studentId === studentId && e.courseId === courseId);
            if (enr) {
                const updatedEnr = { ...enr, remainingHours: Math.min(enr.remainingHours + 1, enr.totalHours) };
                await saveData('enrollments', updatedEnr);
                setEnrollments(prev => prev.map(e => e.id === enr.id ? updatedEnr : e));
            }
        }
    };

    const deleteStudent = async (student: any) => {
        const input = window.prompt(`พิมพ์คำว่า "จริง" เพื่อลบ นักเรียน ${student.name}`);
        if (input === 'จริง') {
            await saveData('students', student, 'delete');
            setStudents((prev: any) => prev.filter((s: any) => s.id !== student.id));
            setEnrollments((prev: any) => prev.filter((e: any) => e.studentId !== student.id));
            setModalType(null);
        }
    };

    const deletePayment = async (id: number) => {
        if (window.confirm('ลบรายการรับเงินใช่หรือไม่?')) {
            const pay = payments.find((p: any) => p.id === id);
            if (pay) {
                await saveData('payments', pay, 'delete');
                const enr = enrollments.find((e: any) => e.studentId === pay.studentId && e.courseId === pay.courseId);
                if (enr) {
                    const updatedEnr = { ...enr, balance: (enr.balance || 0) + pay.amount, paid: false };
                    await saveData('enrollments', updatedEnr);
                    setEnrollments(prev => prev.map(e => e.id === enr.id ? updatedEnr : e));
                }
                setPayments((prev: any) => prev.filter((p: any) => p.id !== id));
            }
            setSwipedId(null);
        }
    };

    const deleteExpense = async (id: number) => {
        if (window.confirm('ลบรายการรายจ่ายใช่หรือไม่?')) {
            const exp = expenses.find((e: any) => e.id === id);
            if (exp) {
                await saveData('expenses', exp, 'delete');
                setExpenses((prev: any) => prev.filter((e: any) => e.id !== id));
            }
            setSwipedId(null);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const timestamp = formData.date ? new Date(formData.date).getTime() : Date.now();
        const customDate = formatThaiDate(timestamp);

        if (modalType === 'addStudent' || modalType === 'editStudent') {
            const studentData = { ...formData };
            // Removed: if (!studentData.id) (studentData as any).timestamp = Date.now(); 
            // because 'timestamp' does not exist in the 'students' D1 table schema.
            const sid = await saveData('students', studentData);
            if (!formData.id) setStudents([...students, { ...studentData, id: sid }]);
            else setStudents(prev => prev.map(s => s.id === formData.id ? { ...s, ...formData } : s));
        }
        else if (modalType === 'addCourse' || modalType === 'editCourse') {
            const courseData = {
                name: formData.name,
                price: Number(formData.price),
                totalSessions: Number(formData.totalSessions)
            };
            if (formData.id) (courseData as any).id = formData.id;
            const cid = await saveData('courses', courseData);

            // Handle Schedules
            if (formData.id) {
                // Delete old schedules first (simplified for this migration)
                const oldSchs = schedules.filter(s => s.courseId === formData.id);
                for (const os of oldSchs) await saveData('schedules', os, 'delete');
            }

            const newSchedules: any[] = [];
            for (const s of formData.schedulesList) {
                if (!s.day || !s.time) continue;
                const [start, end] = s.time.split('-');
                const schData = { courseId: cid, day: s.day, start, end, room: s.room, teacher: s.teacher };
                const schId = await saveData('schedules', schData);
                newSchedules.push({ ...schData, id: schId });
            }

            if (!formData.id) {
                setCourses([...courses, { ...courseData, id: cid }]);
                setSchedules([...schedules, ...newSchedules]);
            } else {
                setCourses(prev => prev.map(c => c.id === formData.id ? { ...c, ...courseData } : c));
                setSchedules(prev => [...prev.filter(s => s.courseId !== formData.id), ...newSchedules]);
            }
        }
        else if (modalType === 'enrollStudent') {
            const cInfo = getCourseInfo(Number(formData.courseId));
            let payAmount = Number(formData.payAmount ?? cInfo.price);

            const ratePerHour = cInfo.price / (cInfo.totalSessions || 1);
            let grantedHours = cInfo.totalSessions;
            let balance = 0;

            if (formData.enrollType === 'reduceHours' && payAmount < cInfo.price) {
                grantedHours = Math.floor(payAmount / ratePerHour);
                payAmount = grantedHours * ratePerHour;
            } else if (formData.enrollType === 'debt') {
                balance = cInfo.price - payAmount;
            }

            const enrData = {
                studentId: Number(formData.studentId), courseId: Number(formData.courseId),
                remainingHours: grantedHours, totalHours: grantedHours,
                paid: balance <= 0, balance: Math.max(0, balance),
                date: customDate, timestamp
            };
            const enrid = await saveData('enrollments', enrData);
            setEnrollments([...enrollments, { ...enrData, id: enrid }]);

            if (payAmount > 0) {
                const pData = {
                    studentId: Number(formData.studentId), courseId: Number(formData.courseId),
                    studentName: getStudentInfo(Number(formData.studentId)).nickname,
                    course: cInfo.name, amount: payAmount, type: 'เงินสด', timestamp, date: customDate
                };
                const pid = await saveData('payments', pData);
                setPayments([...payments, { ...pData, id: pid }]);
            }
        }
        else if (modalType === 'addPayment') {
            const pData = {
                studentId: Number(formData.studentId), courseId: Number(formData.courseId),
                studentName: getStudentInfo(Number(formData.studentId)).nickname,
                course: getCourseInfo(Number(formData.courseId)).name,
                amount: Number(formData.amount), type: formData.type, slipFile: formData.slipFile,
                timestamp, date: customDate
            };
            const pid = await saveData('payments', pData);
            setPayments([...payments, { ...pData, id: pid }]);

            const enr = enrollments.find(e => e.studentId === Number(formData.studentId) && e.courseId === Number(formData.courseId));
            if (enr) {
                const updatedEnr = { ...enr, balance: Math.max(0, enr.balance - Number(formData.amount)), paid: (enr.balance - Number(formData.amount)) <= 0 };
                await saveData('enrollments', updatedEnr);
                setEnrollments(prev => prev.map(e => e.id === enr.id ? updatedEnr : e));
            }
        }
        else if (modalType === 'addExpense') {
            const eData = { name: formData.expenseName, amount: Number(formData.amount), type: formData.type, timestamp, date: customDate };
            const eid = await saveData('expenses', eData);
            setExpenses([...expenses, { ...eData, id: eid }]);
        }

        setModalType(null);
        setFormData({});
    };

    if (authLoading || (user && isApproved === null)) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 animate-pulse">กำลังโหลดระบบ...</div>;
    if (!user) return <GoogleLogin onLogin={setUser} error={error} />;

    // WAITING FOR APPROVAL SCREEN
    if (user && isApproved === false && !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-center">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <ShieldCheck size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">รอการอนุมัติสิทธิ์</h1>
                    <p className="text-slate-500 font-bold mb-8 text-sm leading-relaxed">
                        บัญชีของคุณ ({user.email}) อยู่ระหว่างรอผู้ดูแลระบบอนุมัติเพื่อเข้าใช้งานระบบ Tutor Manager
                    </p>
                    <a
                        href="https://www.facebook.com/nattawat.nantapan"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black uppercase tracking-wider mb-4 hover:bg-emerald-100 transition-colors"
                    >
                        ติดต่อผู้ดูแลระบบผ่าน Facebook
                    </a>
                    <button
                        onClick={() => { signOut(auth); setIsApproved(null); }}
                        className="w-full h-12 border-2 border-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-black uppercase tracking-wider hover:bg-slate-50 transition-colors"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        );
    }

    const privateNetProfit = totalRevMonth - totalExpMonth;
    const sharedState = {
        students, setStudents,
        teachers, setTeachers,
        rooms, setRooms,
        courses, setCourses,
        enrollments, setEnrollments,
        schedules, setSchedules,
        payments, setPayments,
        expenses, setExpenses,
        attendances, setAttendances,
        selectedMonth, setSelectedMonth,
        getStudentInfo, getCourseInfo,
        teachersList, selectedTeacher, setSelectedTeacher,
        currentMonthPayments, currentMonthExpenses,
        totalRevMonth, totalExpMonth,
        netProfit: privateNetProfit,
        modalType, setModalType,
        formData, setFormData,
        selectedClass, setSelectedClass,
        checkDate, setCheckDate,
        deleteCourse, openEditCourse,
        deletePayment, deleteExpense,
        swipedId, setSwipedId
    };

    const NavButtonDesktop = ({ id, icon: Icon, label }: any) => (
        <button onClick={() => setActiveTab(id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-bold ${activeTab === id ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <Icon size={20} className="mr-3" />
            <span className="text-[14px]">{label}</span>
        </button>
    );

    const NavButtonMobile = ({ id, icon: Icon, label }: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeTab === id ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'}`}>
            <Icon size={20} />
            <span className="text-[10px] mt-1 font-bold">{label}</span>
        </button>
    );

    if (printMode) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
                <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm shrink-0">
                    <div className="h-24 px-6 flex items-center border-b border-slate-100">
                        <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white mr-3"><FileText size={20} /></div>
                        <h1 className="font-black text-xl leading-tight uppercase tracking-widest text-slate-800">Tutor<span className="text-emerald-700">M</span></h1>
                    </div>
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <button onClick={() => setPrintMode(null)} className="w-full flex items-center px-4 py-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 mb-4 hover:shadow-md transition-all">
                            <ArrowLeft size={20} className="mr-3" /> กลับหน้าหลัก
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8 border-b pb-4">
                                <button onClick={() => setPrintMode(null)} className="flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors">
                                    <ArrowLeft size={20} className="mr-2" /> กลับ
                                </button>
                                <button
                                    onClick={() => {
                                        const win = window.open('', '_blank');
                                        if (printMode === 'finance') {
                                            PdfService.generateFinanceReport({
                                                monthName: MONTHS_TH[selectedMonth],
                                                totalRev: totalRevMonth, totalExp: totalExpMonth,
                                                teachers, ratios: {}, expenses: currentMonthExpenses, payments: currentMonthPayments
                                            }, win);
                                        } else {
                                            PdfService.generateTimetableReport({ schedules, courses, days_th: DAYS_TH }, win);
                                        }
                                    }}
                                    className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:bg-emerald-800 transition-all flex items-center"
                                >
                                    <Printer size={20} className="mr-2" /> พิมพ์ PDF
                                </button>
                            </div>

                            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
                                <h2 className="text-3xl font-black text-center text-slate-800 mb-2">
                                    {printMode === 'finance' ? `สรุปการเงินเดือน${MONTHS_TH[selectedMonth]}` : 'ตารางสอนประจำสัปดาห์'}
                                </h2>
                                <p className="text-center text-slate-400 font-bold mb-10 italic underline decoration-emerald-200">*** ข้อมูลนี้เป็นเพียงตัวอย่างก่อนการพิมพ์จริง ***</p>

                                {printMode === 'finance' ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">รายรับ</p><p className="text-2xl font-black text-emerald-700">฿{totalRevMonth.toLocaleString()}</p></div>
                                            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">รายจ่าย</p><p className="text-2xl font-black text-red-600">฿{totalExpMonth.toLocaleString()}</p></div>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">กำไร</p><p className="text-2xl font-black text-slate-800">฿{privateNetProfit.toLocaleString()}</p></div>
                                        </div>
                                        <div className="border border-slate-100 rounded-3xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                                                    <tr><th className="px-6 py-4 text-left">วันที่</th><th className="px-6 py-4 text-left">รายการ</th><th className="px-6 py-4 text-right">จำนวนเงิน</th></tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {[...currentMonthPayments.map(p => ({ d: p.date, l: `รับค่าเรียน: ${p.studentName}`, a: p.amount, t: 'inc' })),
                                                    ...currentMonthExpenses.map(e => ({ d: e.date, l: `ค่าใช้จ่าย: ${e.name}`, a: e.amount, t: 'exp' }))].map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="px-6 py-4 font-bold text-slate-400">{item.d}</td>
                                                            <td className="px-6 py-4 font-black text-slate-700">{item.l}</td>
                                                            <td className={`px-6 py-4 text-right font-black ${item.t === 'inc' ? 'text-emerald-700' : 'text-red-500'}`}>฿{item.a.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-slate-100 rounded-2xl overflow-x-auto p-4">
                                        {/* Timetable view simplified for preview */}
                                        <p className="text-center py-20 text-slate-400 font-bold">ตารางเวลาจะแสดงผลเต็มรูปแบบในไฟล์ PDF</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm z-20 shrink-0">
                <div className="h-24 px-6 flex items-center border-b border-slate-100">
                    <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white mr-3 shadow-md"><GraduationCap size={22} /></div>
                    <div>
                        <h1 className="font-black text-xl leading-tight uppercase tracking-widest text-slate-800">Tutor<span className="text-emerald-700">M</span></h1>
                        <p className="text-[10px] font-bold text-slate-400">PWA Edition</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">เมนูหลัก</h3>
                    {NAV_ITEMS.map(item => <NavButtonDesktop key={item.id} {...item} />)}

                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 mt-10 pt-8 border-t border-slate-100">รายงาน (PDF)</h3>
                    <button onClick={() => setPrintMode('finance')} className="w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-[15px]">
                        <FileText size={20} className="mr-3" /> สรุปการเงิน
                    </button>
                    <button onClick={() => setPrintMode('timetable')} className="w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-[15px]">
                        <Calendar size={20} className="mr-3" /> ตารางสอน
                    </button>

                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 mt-10 pt-8 border-t border-slate-100">ข้อมูล (Excel)</h3>
                    <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
                    <button onClick={handleExcelClick} className="w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-[15px]">
                        <FileText size={20} className="mr-3 text-emerald-500" /> โหลดข้อมูล
                    </button>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center p-3 bg-white rounded-2xl border border-slate-200 mb-2 shadow-sm">
                        <div className="w-10 h-10 rounded-full mr-3 border-2 border-emerald-100 bg-emerald-700 flex items-center justify-center text-white font-bold"><ShieldCheck size={20} /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">{user?.email}</p>
                        </div>
                    </div>
                    {/* Database Sync Status UI */}
                    <div className={`p-2 rounded-xl border flex items-center justify-center space-x-2 mb-4 text-[9px] font-black uppercase tracking-widest ${syncStatus === 'live' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : syncStatus === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {syncStatus === 'live' ? (
                            <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span>Firestore Cloud Sync</span></>
                        ) : syncStatus === 'error' ? (
                            <><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /><span>Sync Failed</span></>
                        ) : (
                            <><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" /><span>Cloud Syncing...</span></>
                        )}
                    </div>
                    <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center p-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        <LogOut size={16} className="mr-2" /> ออกจากระบบ
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="md:hidden h-16 px-5 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white"><GraduationCap size={18} /></div>
                        <h1 className="font-black text-sm uppercase tracking-widest">Tutor<span className="text-emerald-700">M</span></h1>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        <Menu size={22} />
                    </button>
                </header>

                {/* Mobile Sidebar - Right Side */}
                {isSidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-200">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                        <aside className="relative w-72 bg-white h-full shadow-2xl flex flex-col ml-auto animate-in slide-in-from-right duration-500">
                            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
                                <div className="flex items-center">
                                    <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white mr-3 shadow-md"><GraduationCap size={20} /></div>
                                    <h1 className="font-black text-base uppercase tracking-widest">Tutor<span className="text-emerald-700">M</span></h1>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-lg border border-slate-100"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">เมนูหลัก</h3>
                                {NAV_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                        className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all font-bold ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                    >
                                        <item.icon size={22} className="mr-4" />
                                        <span className="text-[16px]">{item.label}</span>
                                    </button>
                                ))}
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 mt-10 pt-8 border-t border-slate-100">รายงาน</h3>
                                <button onClick={() => { setPrintMode('finance'); setIsSidebarOpen(false); }} className="w-full flex items-center px-4 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-[16px]">
                                    <FileText size={22} className="mr-4" /> สรุปการเงิน
                                </button>
                                <button onClick={() => { setPrintMode('timetable'); setIsSidebarOpen(false); }} className="w-full flex items-center px-4 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-[16px]">
                                    <Calendar size={22} className="mr-4" /> ตารางสอน
                                </button>
                            </div>
                            <div className="p-5 border-t border-slate-100">
                                <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center p-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg mb-2">
                                    <LogOut size={18} className="mr-3" /> ออกจากระบบ
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto w-full">
                        {activeTab === 'students' && <StudentsPage {...sharedState} />}
                        {activeTab === 'classes' && <ClassesPage {...sharedState} />}
                        {activeTab === 'finance' && <FinancePage {...sharedState} />}
                        {activeTab === 'history' && <HistoryPage {...sharedState} />}
                        {activeTab === 'admin' && isAdmin && <AdminPage />}
                    </div>
                </main>

                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 pb-8 pt-3 flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[32px]">
                    {NAV_ITEMS.map(item => <NavButtonMobile key={item.id} {...item} />)}
                </nav>
            </div>

            {/* Modals */}
            {modalType === 'manageBasics' && (
                <ManageBasicsModal
                    teachers={teachers} setTeachers={setTeachers}
                    rooms={rooms} setRooms={setRooms}
                    onClose={() => setModalType(null)}
                />
            )}

            {selectedClass && (
                <AttendanceModal
                    selectedClass={selectedClass} onClose={() => setSelectedClass(null)}
                    checkDate={checkDate} setCheckDate={setCheckDate}
                    enrollments={enrollments} attendances={attendances}
                    getStudentInfo={getStudentInfo} getCourseInfo={getCourseInfo}
                    undoAttendance={undoAttendance} deductHour={deductHour}
                />
            )}

            {modalType && modalType !== 'manageBasics' && (
                <FormsModal
                    modalType={modalType} formData={formData} setFormData={setFormData}
                    onClose={() => setModalType(null)} onSubmit={handleFormSubmit}
                    teachers={teachers} rooms={rooms} courses={courses} enrollments={enrollments}
                    getStudentInfo={getStudentInfo} getCourseInfo={getCourseInfo}
                    deleteStudent={deleteStudent}
                />
            )}
        </div>
    );
}
