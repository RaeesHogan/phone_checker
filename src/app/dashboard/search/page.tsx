"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReservationForm from "@/components/forms/ReservationForm";
import DashboardSearch from "@/components/features/DashboardSearch";
import { 
  Search, 
  LayoutDashboard, 
  LogOut, 
  ChevronLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";

function SearchContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [initialPhone, setInitialPhone] = useState<string | undefined>(undefined);
  const [hasMainProduct, setHasMainProduct] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (status === "loading") {
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

  const handleSelectPhone = (phone: string, mainExists: boolean) => {
    setInitialPhone(phone);
    setHasMainProduct(mainExists);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="bg-blue-600 p-2 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">ระบบเช็คเบอร์</h1>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Search Terminal */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">ค้นหาเบอร์โทรศัพท์</h2>
              <p className="text-slate-500 font-medium mt-2">ตรวจสอบสถานะการจองและสินค้าที่ถูกล็อคก่อนดำเนินการ</p>
            </div>
            <DashboardSearch onSelectPhone={handleSelectPhone} />
          </div>

          {/* Reservation Form (Conditional) */}
          {showForm && (
            <div className="animate-in fade-in zoom-in-95 duration-500 scroll-mt-24" id="reservation-form">
              <div className="mb-6 px-2 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">เพิ่มการจองสำหรับเบอร์ {initialPhone}</h2>
                  <p className="text-slate-500 font-medium mt-1">
                    {hasMainProduct 
                      ? "⚠️ เบอร์นี้มีสินค้าหลักแล้ว ระบบจะล็อคการเพิ่มสินค้าหลักใหม่" 
                      : "✅ เบอร์นี้ยังไม่มีสินค้าหลัก คุณสามารถระบุสินค้าหลักได้ 1 รายการ"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  ยกเลิก
                </button>
              </div>
              <ReservationForm 
                initialPhone={initialPhone} 
                hasMainProduct={hasMainProduct}
                onSuccess={() => router.push("/dashboard")} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />}>
      <SearchContent />
    </Suspense>
  );
}
