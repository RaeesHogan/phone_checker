"use client";

import { useState, useEffect } from "react";
import { Search, Phone, ShieldCheck, Lock, Clock, ArrowRight, UserPlus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import toast from "react-hot-toast";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth status & load history on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        setIsLoggedIn(!!session?.user);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    const history = localStorage.getItem("recent_searches");
    if (history) setRecentSearches(JSON.parse(history));
  }, []);

  const saveToHistory = (num: string) => {
    const updated = [num, ...recentSearches.filter(s => s !== num)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const handleSearch = async (targetPhone: string) => {
    if (targetPhone.length !== 10) return;
    
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/public/search?phone=${encodeURIComponent(targetPhone)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setResult(data);
      saveToHistory(targetPhone);
      
      if (data.found) {
        toast.error("เบอร์นี้มีการจองแล้ว", { icon: "🔒" });
      } else {
        toast.success("เบอร์นี้ยังว่างอยู่", { icon: "✅" });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val.length === 10) {
      handleSearch(val);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              ReserveLock
            </span>
          </div>
          <Link 
            href="/auth/login" 
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <span>สำหรับเจ้าหน้าที่</span>
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            ตรวจสอบสถานะการจอง
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            ระบุเบอร์โทรศัพท์ลูกค้าเพื่อตรวจสอบสถานะ <br className="hidden md:block" />
            และดำเนินการจองในขั้นตอนถัดไป
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-8 md:p-12 transition-all duration-300">
          <div className="space-y-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <input
                type="tel"
                placeholder="กรอกเบอร์โทรศัพท์ลูกค้า 10 หลัก"
                autoFocus
                value={phone}
                onChange={onPhoneChange}
                className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300 tracking-wider font-mono"
              />
              {loading && (
                <div className="absolute inset-y-0 right-5 flex items-center">
                  <div className="w-6 h-6 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !result && !loading && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>ค้นหาล่าสุด</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(num => (
                    <button
                      key={num}
                      onClick={() => { setPhone(num); handleSearch(num); }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {result && !result.found && (
                <div className="flex flex-col items-center text-center p-12 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 space-y-6">
                  <div className="bg-white p-4 rounded-full shadow-lg shadow-emerald-200/50">
                    <ArrowRight className="w-12 h-12 text-emerald-500 rotate-90 md:rotate-0" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-emerald-900 tracking-tight">เบอร์โทรศัพท์นี้ยังว่าง</h3>
                    <p className="text-emerald-700/70 text-lg">คุณสามารถดำเนินการจองให้ลูกค้าได้ทันที</p>
                  </div>
                  
                  <Link 
                    href={isLoggedIn 
                      ? `/dashboard?phone=${phone}` 
                      : `/auth/login?callbackUrl=/dashboard?phone=${phone}`
                    }
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 text-xl"
                  >
                    <span>{isLoggedIn ? "ดำเนินการจองทันที" : "เข้าสู่ระบบเพื่อจอง"}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {result && result.found && (
                <div className="flex flex-col items-center text-center p-12 bg-slate-900 rounded-[2rem] space-y-6 text-white shadow-2xl shadow-slate-900/20">
                  <div className="bg-white/10 p-4 rounded-full border border-white/20">
                    <Lock className="w-12 h-12 text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight">เบอร์นี้มีการจองแล้ว</h3>
                    <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
                      มีเจ้าหน้าที่ท่านอื่นจองเบอร์นี้ไว้แล้ว ระบบไม่อนุญาตให้จองซ้ำจนกว่าการจองเดิมจะหมดอายุ
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-12 text-center text-slate-400 text-sm font-medium">
          &copy; 2026 Customer Reservation Lock System. ความปลอดภัยของข้อมูลคือหัวใจสำคัญ
        </p>
      </main>
    </div>
  );
}
