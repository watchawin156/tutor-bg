import React from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LogOut, GraduationCap, ArrowRight } from 'lucide-react';

interface GoogleLoginProps {
    onLogin: (user: any) => void;
    error?: string | null;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLogin, error }) => {
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (err) {
            console.error("Login Error:", err);
            alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-slate-100 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>

                <h1 className="text-2xl font-black text-slate-800 mb-1">Tutor Manager</h1>
                <p className="text-slate-500 font-bold mb-8 text-sm uppercase tracking-widest">Login with Google to access</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-pulse">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full h-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-3" />
                    เข้าสู่ระบบด้วย Google
                    <ArrowRight className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                </button>

                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    สำหรับการอนุญาตใช้งาน กรุณาติดต่อ<br />
                    <span className="text-emerald-600">watchawin.tha@gmail.com</span>
                </p>
            </div>
        </div>
    );
};

export default GoogleLogin;
