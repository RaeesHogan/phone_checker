"use client";

import { useState } from "react";
import { Phone, Search, Loader2, Star, AlertCircle, ArrowLeft, Package, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function CheckPhonePage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/public/search?phone=${phone}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการค้นหา");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-12 md:pt-24">
      {/* Subtle Navigation */}
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        กลับไปยังหน้าหลัก
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-2">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">ตรวจสอบสถานะเบอร์</h1>
          <p className="text-sm font-medium text-slate-500">ระบุเบอร์โทรศัพท์เพื่อดูรายการสินค้าที่ล็อคไว้</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="tel"
            maxLength={10}
            placeholder="08XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-3xl text-xl font-mono focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {/* Result Area */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!result.found ? (
              <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="font-bold text-slate-800 uppercase tracking-tight">เบอร์นี้ยังไม่มีการจอง</p>
                <p className="text-xs text-slate-400">คุณสามารถจองสินค้าหลักให้ลูกค้ารายนี้ได้ทันที</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4" /> รายการที่ล็อคอยู่
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full border border-amber-200">LOCKED</span>
                </div>
                <div className="p-4 space-y-2">
                  {result.lockedItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                          item.isMainProduct ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {item.isMainProduct ? <Star className="w-5 h-5 fill-amber-500" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-mono font-black text-slate-900 text-lg">{item.productCode}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {item.isMainProduct ? "สินค้าหลัก" : "สินค้าย่อย"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-amber-50/50 border-t border-amber-50">
                  <p className="text-[11px] text-amber-700 font-bold leading-relaxed text-center">
                    ⚠️ เบอร์นี้มีการจองสินค้าที่เลือกไว้แล้ว ไม่สามารถจองซ้ำได้จนกว่าจะหมดอายุ
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { ChevronRight } from "lucide-react";
