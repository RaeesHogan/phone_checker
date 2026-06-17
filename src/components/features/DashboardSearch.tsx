"use client";

import { useState, useEffect } from "react";
import { Search, Phone, CheckCircle2, Star, ArrowRight, Loader2, Clock, AlertTriangle, CheckSquare, Square, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DashboardSearchProps {
  onSelectPhone: (phone: string, hasMainProduct: boolean) => void;
}

export default function DashboardSearch({ onSelectPhone }: DashboardSearchProps) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
    setAcceptedTerms(false);
    setShowPopup(false);

    try {
      const res = await fetch(`/api/public/search?phone=${encodeURIComponent(targetPhone)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setResult(data);
      saveToHistory(targetPhone);
      
      if (data.found) {
        setShowPopup(true);
        toast.error("เบอร์นี้มีการจองสินค้าบางรายการแล้ว", { icon: "🔒" });
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
      setShowPopup(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Search Terminal UI (Light Theme) */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">ตรวจสอบสถานะเบอร์</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Number Verification System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <input
                type="tel"
                placeholder="08XXXXXXXX"
                value={phone}
                onChange={onPhoneChange}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black focus:outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all placeholder:text-slate-300 tracking-[0.1em] font-mono text-slate-900 shadow-inner"
              />
              {loading && (
                <div className="absolute inset-y-0 right-6 flex items-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {/* History Tags */}
            {history.length > 0 && !result && !loading && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> ประวัติล่าสุด
                </p>
                {history.map(num => (
                  <button
                    key={num}
                    onClick={() => { setPhone(num); handleSearch(num); }}
                    className="px-4 py-2 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-xl text-xs font-bold transition-all hover:shadow-md active:scale-95"
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {/* Success Result */}
            {result && !result.found && (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-sm shadow-emerald-100/50">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm text-emerald-500 border border-emerald-100">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-emerald-700 font-black text-lg tracking-tight">เบอร์นี้ว่างอยู่</p>
                    <p className="text-emerald-600/60 text-[10px] font-black uppercase tracking-widest mt-0.5">Ready for booking</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectPhone(phone, false)}
                  className="group flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-emerald-200"
                >
                  <span>จองสินค้าใหม่</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Found / Locked Result */}
            {result && result.found && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" /> รายการที่ล็อคอยู่
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-full border border-red-200 animate-pulse">LOCKED</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.lockedItems.map((item: any) => (
                      <div 
                        key={item.productCode} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-2xl border transition-colors",
                          item.isMainProduct 
                            ? "bg-amber-50 border-amber-100" 
                            : "bg-red-50 border-red-100"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                          item.isMainProduct ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                        )}>
                          {item.isMainProduct ? <Star className="w-5 h-5 fill-amber-500" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-mono font-black text-slate-900 text-lg leading-tight">{item.productCode}</p>
                          <p className={cn(
                            "text-[9px] font-black uppercase tracking-tight",
                            item.isMainProduct ? "text-amber-600" : "text-red-600"
                          )}>
                            {item.isMainProduct ? "สินค้าหลัก ⭐" : "สินค้าย่อย"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Internal Staff Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                    <button
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className="flex items-start gap-3 w-full text-left group"
                    >
                      <div className={cn(
                        "mt-0.5 p-0.5 rounded transition-colors border-2",
                        acceptedTerms ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-transparent group-hover:border-blue-400"
                      )}>
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                        ฉันเข้าใจและยอมรับเงื่อนไข <span className="text-red-500 underline decoration-red-200 underline-offset-2">(ห้ามขายสินค้าที่ล็อคซ้ำ {result.hasMainProduct && ", ห้ามเพิ่มสินค้าหลักซ้ำ"})</span>
                      </p>
                    </button>

                    <button 
                      disabled={!acceptedTerms}
                      onClick={() => onSelectPhone(phone, result.hasMainProduct)}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:shadow-none"
                    >
                      <span>ดำเนินการจองสินค้าอื่นเพิ่ม</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Search className="absolute -right-12 -bottom-12 w-48 h-48 text-slate-50 group-hover:text-slate-100 transition-colors duration-1000 rotate-12" />
      </div>
    </div>
  );
}
