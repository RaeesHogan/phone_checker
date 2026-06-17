"use client";

import { createReservation } from "@/app/actions/reservation";
import { useState, useRef, useEffect } from "react";
import { User, Phone, MapPin, Tag, FileText, Send, Loader2, Plus, Trash2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ReservationForm({ initialPhone, onSuccess }: { initialPhone?: string, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(initialPhone || "");
  const [items, setItems] = useState([{ productCode: "", quantity: 1, isMainProduct: true }]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync state if initialPhone changes
  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
  };

  const addItem = () => {
    setItems([...items, { productCode: "", quantity: 1, isMainProduct: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    // Ensure at least one main product
    if (items[index].isMainProduct && newItems.length > 0) {
      newItems[0].isMainProduct = true;
    }
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "isMainProduct") {
      newItems.forEach((item, i) => item.isMainProduct = i === index);
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (phone.length !== 10) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    if (items.some(i => !i.productCode.trim())) {
      toast.error("กรุณาระบุรหัสสินค้าให้ครบทุกรายการ");
      return;
    }
    
    setLoading(true);

    const payload = {
      customerName: (formData.get("customerName") as string)?.trim(),
      phoneNumber: phone,
      address: (formData.get("address") as string)?.trim(),
      totalPrice: totalPrice,
      notes: (formData.get("notes") as string)?.trim() || null,
      items: items,
    };

    const result = await createReservation(payload);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      setPhone("");
      setItems([{ productCode: "", quantity: 1, isMainProduct: true }]);
      setTotalPrice(0);
      formRef.current?.reset();
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
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">เพิ่มการจองใหม่ (หลายรายการ)</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Tag className="w-4 h-4 text-slate-400" />
              <span>รายการสินค้า *</span>
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider"
            >
              <Plus className="w-3 h-3" />
              <span>เพิ่มสินค้า</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex-1 grid grid-cols-12 gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="col-span-7">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">รหัสสินค้า</p>
                    <input
                      type="text"
                      value={item.productCode}
                      onChange={(e) => updateItem(index, "productCode", e.target.value)}
                      placeholder="เช่น PROD-01"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">จำนวน</p>
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">หลัก</p>
                    <input
                      type="radio"
                      checked={item.isMainProduct}
                      onChange={() => updateItem(index, "isMainProduct", true)}
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="mt-8 p-2 text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span>ราคารวมทั้งหมด (บาท) *</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={totalPrice}
            onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-blue-600"
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
