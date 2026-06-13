"use client";

import { updateSettings } from "@/app/actions/settings";
import { ArrowLeft, Settings, Clock, Calendar, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SettingsClientProps {
  initialSettings: { [key: string]: string };
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const handleSubmit = async (formData: FormData) => {
    const result = await updateSettings(formData);
    if (result.success) {
      toast.success("บันทึกการตั้งค่าสำเร็จ");
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>กลับหน้า Admin</span>
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งค่าระบบ (Settings)</h1>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <form action={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>จำนวนวันหมดอายุการจอง (วัน)</span>
                </label>
                <input
                  name="RESERVATION_EXPIRE_DAYS"
                  type="number"
                  defaultValue={initialSettings["RESERVATION_EXPIRE_DAYS"] || "14"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-lg"
                  required
                />
                <div className="flex items-center gap-2 text-xs text-slate-500 ml-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ค่าเริ่มต้นคือ 14 วัน (มีผลกับการจองใหม่เท่านั้น)</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Session Timeout (ชั่วโมง)</span>
                </label>
                <input
                  name="SESSION_TIMEOUT_HOURS"
                  type="number"
                  defaultValue={initialSettings["SESSION_TIMEOUT_HOURS"] || "8"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-lg"
                  required
                />
                <p className="text-xs text-slate-500 ml-1">ระยะเวลาที่อนุญาตให้เจ้าหน้าที่อยู่ในระบบโดยไม่ต้อง Login ใหม่</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 text-lg"
              >
                <Save className="w-5 h-5" />
                <span>บันทึกการตั้งค่าทั้งหมด</span>
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          การเปลี่ยนค่าบางอย่างอาจต้องรีสตาร์ท Server หรือเคลียร์ Cache เพื่อให้เห็นผลทันที
        </p>
      </div>
    </div>
  );
}
