"use client";

import { cancelReservation } from "@/app/actions/reservation";
import { format, differenceInDays, startOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { Trash2, Phone, Calendar, Package, User, AlertCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReservationListProps {
  reservations: any[];
  onSuccess?: () => void;
}

export default function ReservationList({ reservations, onSuccess }: ReservationListProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const handleCancel = async (id: string) => {
    if (confirm("ยืนยันการยกเลิกการจองนี้? ระบบจะไม่สามารถกู้คืนสถานะ Active ได้")) {
      const result = await cancelReservation(id);
      if (result.error) {
        alert(result.error);
      } else {
        if (onSuccess) onSuccess();
      }
    }
  };

  const getDaysRemaining = (date: string) => {
    const today = startOfDay(new Date());
    const expiry = startOfDay(new Date(date));
    return differenceInDays(expiry, today);
  };

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <Package className="w-12 h-12 opacity-20" />
        <p className="text-lg font-medium">ไม่มีข้อมูลการจองที่กำลังใช้งาน</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 md:mx-0">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 first:rounded-tl-2xl">
              ลูกค้า /เบอร์โทร
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
              สินค้า
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 text-center">
              วันที่เหลือ
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
              วันหมดอายุ
            </th>
            {isAdmin && (
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                คนจอง
              </th>
            )}
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 last:rounded-tr-2xl text-center">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reservations.map((res) => {
            const daysRemaining = getDaysRemaining(res.expirationDate);
            const isNearExpiry = daysRemaining <= 3;
            const isExpired = daysRemaining < 0;

            return (
              <tr key={res.id} className={`group hover:bg-blue-50/30 transition-colors ${isNearExpiry ? 'bg-orange-50/20' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {res.customerName}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span className="font-mono">{res.phoneNumber}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {res.productCode}
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
                  {isNearExpiry && !isExpired && (
                    <div className="text-[10px] font-bold text-orange-600 uppercase mt-1 flex items-center justify-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>ใกล้หมดอายุ</span>
                    </div>
                  )}
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
                  <button
                    onClick={() => handleCancel(res.id)}
                    className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                    title="ยกเลิกการจอง"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
