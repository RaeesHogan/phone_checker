"use client";

import { cancelReservation } from "@/app/actions/reservation";
import { format, differenceInDays, startOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { Trash2, Phone, Calendar, Package, User, AlertCircle, Clock, Search, Star, Eye, Info, ListFilter } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReservationListProps {
  reservations: any[];
  onSuccess?: () => void;
}

const getDaysRemaining = (date: string) => {
  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(date));
  return differenceInDays(expiry, today);
};

export default function ReservationList({ reservations, onSuccess }: ReservationListProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [mounted, setMounted] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchCreator, setSearchCreator] = useState("");
  const [sortDays, setSortDays] = useState<"default" | "asc" | "desc">("default");

  const filteredReservations = useMemo(() => {
    let result = [...reservations];

    if (isAdmin && searchCreator.trim()) {
      const query = searchCreator.toLowerCase().trim();
      result = result.filter(res => {
        const username = res.user?.username?.toLowerCase() || "";
        const fullName = res.user?.fullName?.toLowerCase() || "";
        return username.includes(query) || fullName.includes(query);
      });
    }

    if (sortDays !== "default") {
      result.sort((a, b) => {
        const daysA = getDaysRemaining(a.expirationDate);
        const daysB = getDaysRemaining(b.expirationDate);
        return sortDays === "asc" ? daysA - daysB : daysB - daysA;
      });
    }

    return result;
  }, [reservations, isAdmin, searchCreator, sortDays]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("ยืนยันการยกเลิกการจองนี้?")) return;
    
    const loadingToast = toast.loading("กำลังดำเนินการ...");
    try {
      const result = await cancelReservation(id);
      toast.dismiss(loadingToast);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("ยกเลิกการจองสำเร็จ");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.error("Cancel click error:", err);
    }
  };

  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center"><Clock className="w-6 h-6 animate-spin text-slate-200" /></div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <Package className="w-12 h-12 opacity-20" />
        <p className="text-lg font-medium">ไม่มีข้อมูลการจองที่กำลังใช้งาน</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-full sm:flex-1 flex items-center gap-4">
          {isAdmin && (
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาคนจอง..."
                value={searchCreator}
                onChange={(e) => setSearchCreator(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm"
              />
            </div>
          )}
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={sortDays}
            onChange={(e) => setSortDays(e.target.value as any)}
            className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 font-medium shadow-sm"
          >
            <option value="default">เรียงตามวันที่เหลือ (เริ่มต้น)</option>
            <option value="asc">วันที่เหลือน้อยสุด</option>
            <option value="desc">วันที่เหลือมากสุด</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 md:mx-0">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 first:rounded-tl-2xl">ลูกค้า /เบอร์โทร</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">สินค้า</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 text-center">วันที่เหลือ</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">วันหมดอายุ</th>
              {isAdmin && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">คนจอง</th>}
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 last:rounded-tr-2xl text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReservations.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500 font-medium">ไม่พบรายการจองที่ตรงกับการค้นหา</td></tr>
            ) : (
              filteredReservations.map((res) => {
                const daysRemaining = getDaysRemaining(res.expirationDate);
                const isNearExpiry = daysRemaining <= 3;
                const isExpired = daysRemaining < 0;

                const mainProduct = res.items?.find((i: any) => i.isMainProduct)?.productCode || res.items?.[0]?.productCode || "-";

                return (
                  <tr key={res.id} className={`group hover:bg-blue-50/30 transition-colors ${isNearExpiry ? 'bg-orange-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{res.customerName}</span>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span className="font-mono">{res.phoneNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {mainProduct}
                        </div>
                        {res.items && res.items.length > 1 && (
                          <button 
                            onClick={() => setSelectedReservation(res)}
                            className="text-[10px] text-blue-600 font-bold hover:underline text-left ml-1"
                          >
                            +{res.items.length - 1} รายการอื่น (ดูเพิ่ม)
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black ${
                        isExpired ? 'bg-red-100 text-red-700' :
                        isNearExpiry ? 'bg-orange-100 text-orange-700 animate-pulse' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isExpired ? 'หมดอายุ' : `${daysRemaining} วัน`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">
                          {format(new Date(res.expirationDate), "d MMM yy", { locale: th })}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold truncate max-w-[120px]">
                            {res.user?.fullName || res.user?.username || 'Unknown'}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedReservation(res)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancel(res.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                          title="ยกเลิกการจอง"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedReservation && (
            <>
              <DialogHeader className="p-6 bg-slate-900 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <Package className="w-6 h-6 text-blue-400" />
                      รายละเอียดการจอง
                    </DialogTitle>
                    <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">
                      ID: {selectedReservation.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="p-6 space-y-6 bg-white">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ชื่อลูกค้า</p>
                    <p className="font-bold text-slate-900">{selectedReservation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เบอร์โทรศัพท์</p>
                    <p className="font-mono font-bold text-blue-600">{selectedReservation.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ที่อยู่</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedReservation.address}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-blue-600" />
                      รายการสินค้า ({selectedReservation.items?.length || 0})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedReservation.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                            item.isMainProduct ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                          )}>
                            {item.isMainProduct ? <Star className="w-4 h-4 fill-amber-500" /> : idx + 1}
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-900">{item.productCode}</p>
                            {item.isMainProduct && <span className="text-[9px] font-black text-amber-600 uppercase">สินค้าหลัก</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวน</p>
                          <p className="font-bold text-slate-900">{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes & Summary */}
                <div className="space-y-4 pt-2">
                  {selectedReservation.notes && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> หมายเหตุ
                      </p>
                      <p className="text-xs font-medium text-slate-600">{selectedReservation.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ราคารวมทั้งสิ้น</p>
                      <p className="text-xs text-slate-500 italic">รวมภาษีมูลค่าเพิ่มแล้ว</p>
                    </div>
                    <p className="text-2xl font-black text-blue-400">
                      ฿{Number(selectedReservation.totalPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add these Lucide icons to the imports: Eye, Info, ListFilter
