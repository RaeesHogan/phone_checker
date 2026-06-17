"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ReservationForm from "@/components/forms/ReservationForm";
import ReservationList from "@/components/features/ReservationList";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  History, 
  LogOut, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  ListFilter,
  Search
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [initialPhone, setInitialPhone] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch Stats and Data
  const fetchData = async () => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch("/api/dashboard/data", { cache: "no-store" });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recent) setRecentReservations(data.recent);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats and Data on mount
  useEffect(() => {
    fetchData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const userRole = (session?.user as any).role;
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Subtle Standalone Search Link */}
            <Link 
              href="/check-phone"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>โหมดเช็คเบอร์แยก</span>
            </Link>

            {/* Subtle Search Button in Header Area */}
            <Link 
              href="/dashboard/search"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <Search className="w-4 h-4" />
              <span>เช็คเบอร์ลูกค้า</span>
            </Link>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{session?.user?.name}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{userRole}</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200" />
            
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin Quick Action */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Admin Control Panel</p>
                <p className="text-slate-300 text-sm">จัดการผู้ใช้ ตรวจสอบ Log และส่งออกข้อมูล</p>
              </div>
            </div>
            <Link 
              href="/admin" 
              className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>เข้าสู่โหมดผู้ดูแล</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">การจองทั้งหมด</p>
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <History className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total.toLocaleString()}</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">กำลังใช้งาน</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-emerald-600 tracking-tight">{stats.active.toLocaleString()}</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">หมดอายุ</p>
              <div className="p-2 bg-slate-50 rounded-lg text-slate-300">
                <History className="w-4 h-4 opacity-50" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-400 tracking-tight">{stats.expired.toLocaleString()}</h2>
          </div>
        </div>

        <div className="space-y-8">
          {/* Reservation List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <ListFilter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">รายการจองล่าสุด (Active)</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ตรวจสอบและจัดการเบอร์ที่จองไว้</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-widest">
                LIVE STATUS
              </div>
            </div>
            <ReservationList reservations={recentReservations} onSuccess={fetchData} />
          </div>

          {/* Reservation Form (Restored) */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="mb-4 px-2">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">เพิ่มการจองใหม่</h2>
              <p className="text-sm font-medium text-slate-500">กรอกข้อมูลลูกค้าและเบอร์โทรศัพท์เพื่อทำการจอง</p>
            </div>
            <ReservationForm initialPhone={initialPhone} onSuccess={fetchData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
