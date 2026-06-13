"use client";

import { useState, useEffect } from "react";
import { Search, Phone, CheckCircle2, Lock, ArrowRight, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DashboardSearchProps {
  onSelectFreeNumber: (phone: string) => void;
}

export default function DashboardSearch({ onSelectFreeNumber }: DashboardSearchProps) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("staff_search_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (num: string) => {
    const updated = [num, ...history.filter(s => s !== num)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("staff_search_history", JSON.stringify(updated));
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
        toast.success("เบอร์นี้ยังว่างอยู่");
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
    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/40 text-white overflow-hidden relative group border border-white/5">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">เช็คเบอร์ลูกค้า</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Verification Terminal</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <Phone className="w-6 h-6" />
            </div>
            <input
              type="tel"
              placeholder="08XXXXXXXX"
              value={phone}
              onChange={onPhoneChange}
              className="w-full pl-14 pr-4 py-5 bg-white/5 border-2 border-white/10 rounded-[1.5rem] text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-700 tracking-widest font-mono"
            />
            {loading && (
              <div className="absolute inset-y-0 right-5 flex items-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          {/* History in Dashboard Search */}
          {history.length > 0 && !result && !loading && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Clock className="w-3 h-3" />
                <span>ประวัติล่าสุด</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map(num => (
                  <button
                    key={num}
                    onClick={() => { setPhone(num); handleSearch(num); }}
                    className="px-4 py-2 bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-blue-400/50"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="min-h-[90px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            {result && !result.found && (
              <div className="flex items-center justify-between p-6 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[1.5rem] animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-black text-lg tracking-tight leading-tight">เบอร์นี้ว่างอยู่</p>
                    <p className="text-emerald-500/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Ready for booking</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectFreeNumber(phone)}
                  className="group flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-emerald-900/40"
                >
                  <span>ดึงไปจอง</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {result && result.found && (
              <div className="flex items-center gap-4 p-6 bg-red-500/10 border-2 border-red-500/20 rounded-[1.5rem] text-red-400 animate-in zoom-in-95">
                <div className="bg-red-500/20 p-2 rounded-full">
                  <Lock className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <p className="font-black text-lg tracking-tight leading-tight">เบอร์นี้มีการจองแล้ว</p>
                  <p className="text-red-500/40 text-[10px] font-bold uppercase tracking-widest mt-0.5 italic">Locked by system</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Search className="absolute -right-12 -bottom-12 w-48 h-48 text-white/[0.03] group-hover:text-white/[0.05] transition-colors duration-1000 rotate-12" />
    </div>
  );
}
