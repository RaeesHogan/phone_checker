"use client";

// ======================================================
// 🔧 FEATURE FLAG — ตั้งเป็น false เพื่อปิด Popup นี้
// ======================================================
const DISCLAIMER_ENABLED = true;
// ======================================================

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bot, ShieldAlert, X, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "disclaimer_acknowledged_date";

function getTodayString() {
  return new Date().toISOString().split("T")[0]; // "2026-06-30"
}

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!DISCLAIMER_ENABLED) return; // Feature flag ปิดอยู่ → ไม่ทำอะไร
    const lastAcknowledged = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();
    if (lastAcknowledged !== today) {
      // Small delay to let the page render first before showing modal
      const timer = setTimeout(() => setIsOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, getTodayString());
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transition-all duration-300",
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-7 pt-7 pb-10">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-0.5">
                ประกาศสำคัญ
              </p>
              <h2 className="text-xl font-black text-white leading-tight">
                ข้อตกลงการใช้งาน
              </h2>
            </div>
          </div>

          {/* Divider wave at bottom of header */}
          <div className="absolute -bottom-px left-0 right-0 h-6 bg-white" style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} />
        </div>

        {/* Content */}
        <div className="px-7 pt-3 pb-6 space-y-4">
          {/* Item 1: Demo Site */}
          <div className="flex items-start gap-3.5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="mt-0.5 w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm leading-snug">
                เว็บไซต์ตัวอย่าง (Demo)
              </p>
              <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                เว็บไซต์นี้เป็นเว็บไซต์ตัวอย่างสำหรับการสาธิตระบบ ข้อมูลและการทำงานอาจมีการเปลี่ยนแปลงได้
              </p>
            </div>
          </div>

          {/* Item 2: Prohibited Use */}
          <div className="flex items-start gap-3.5 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="mt-0.5 w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm leading-snug">
                ห้ามใช้ในทางที่ผิด
              </p>
              <p className="text-red-700 text-xs mt-0.5 leading-relaxed">
                เว็บไซต์นี้จัดทำขึ้นสำหรับจองสินค้าที่ขายให้ลูกค้าโดยการเช็คเบอร์เท่านั้น กรุณาอย่านำไปใช้ในทางที่ไม่เหมาะสมหรือผิดวัตถุประสงค์
              </p>
            </div>
          </div>

          {/* Item 3: AI Disclaimer */}
          <div className="flex items-start gap-3.5 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="mt-0.5 w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-blue-800 text-sm leading-snug">
                พัฒนาโดย AI
              </p>
              <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
                เว็บไซต์นี้เขียนโค้ดโดย AI และอาจเกิดข้อผิดพลาดหรือความไม่แม่นยำในบางส่วนได้
              </p>
            </div>
          </div>

          {/* Acknowledge Button */}
          <button
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 mt-2"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <span>รับทราบและดำเนินการต่อ</span>
          </button>

          <p className="text-center text-[10px] text-slate-400 font-medium">
            ข้อความนี้จะไม่แสดงอีกในวันนี้
          </p>
        </div>
      </div>
    </div>
  );
}
