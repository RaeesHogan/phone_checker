"use client";

import { createReservation } from "@/app/actions/reservation";
import { useState, useRef, useEffect } from "react";
import { User, Phone, MapPin, Tag, FileText, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ReservationForm({ initialPhone, onSuccess }: { initialPhone?: string, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(initialPhone || "");
  const formRef = useRef<HTMLFormElement>(null);

  // Sync state if initialPhone changes
  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
  };

  const handleSubmit = async (formData: FormData) => {
    if (phone.length !== 10) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }
    
    setLoading(true);

    const result = await createReservation(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      formRef.current?.reset();
      setPhone("");
      toast.success("บันทึกการจองสำเร็จแล้ว");
      if (onSuccess) onSuccess();
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
          <Send className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">เพิ่มการจองใหม่</h2>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <User className="w-4 h-4 text-slate-400" />
              <span>ชื่อลูกค้า *</span>
            </label>
            <input
              name="customerName"
              type="text"
              required
              placeholder="เช่น นายสมชาย ใจดี"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>เบอร์โทรศัพท์ *</span>
            </label>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="08XXXXXXXX"
              required
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-mono"
            />
            <div className="flex justify-between px-1">
              <p className="text-[10px] text-slate-400 font-medium">ระบุตัวเลข 10 หลักเท่านั้น</p>
              <p className={cn("text-[10px] font-bold", phone.length === 10 ? "text-emerald-500" : "text-slate-300")}>
                {phone.length}/10
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>ที่อยู่ *</span>
          </label>
          <textarea
            name="address"
            required
            rows={2}
            placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>รหัสสินค้า *</span>
          </label>
          <input
            name="productCode"
            type="text"
            required
            placeholder="เช่น PROD-99"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>หมายเหตุ</span>
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-blue-600/20 text-lg mt-2"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span>ยืนยันการบันทึกการจอง</span>
              <Send className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
