"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ReservationForm from "@/components/forms/ReservationForm";
import ReservationList from "@/components/features/ReservationList";
import DashboardSearch from "@/components/features/DashboardSearch";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  History, 
  LogOut, 
  ShieldCheck, 
  ChevronRight,
  Loader2
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

  // Sync initial phone from URL
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) setInitialPhone(phoneParam);
  }, [searchParams]);

  // Fetch Stats and Data on mount
  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return;
      
      try {
        const res = await fetch("/api/dashboard/data");
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recent) setRecentReservations(data.recent);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
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
          
          <div className="flex items-center gap-6">
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
          <div className="mb-8 p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Admin Control Panel</p>
                <p className="text-blue-100 text-sm">คุณมีสิทธิ์เข้าถึงการจัดการระบบและส่งออกข้อมูล</p>
              </div>
            </div>
            <Link 
              href="/admin" 
              className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>เข้าสู่โหมดผู้ดูแล</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Search & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <DashboardSearch onSelectFreeNumber={(num) => setInitialPhone(num)} />

            {/* Stats Grid - Vertical in Sidebar */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">การจองทั้งหมด</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total.toLocaleString()}</h2>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">กำลังใช้งาน</p>
                <h2 className="text-3xl font-black text-emerald-600 tracking-tight">{stats.active.toLocaleString()}</h2>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">หมดอายุ</p>
                <h2 className="text-3xl font-black text-slate-400 tracking-tight">{stats.expired.toLocaleString()}</h2>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Form & List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 gap-8">
               <ReservationForm initialPhone={initialPhone} />
               
               <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" />
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">รายการจองล่าสุด (Active)</h2>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 px-3 py-1 rounded-full tracking-widest">
                    Top 10 Live
                  </div>
                </div>
                <ReservationList reservations={recentReservations} />
              </div>
            </div>
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
