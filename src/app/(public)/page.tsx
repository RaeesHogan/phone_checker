"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse">กำลังนำคุณเข้าสู่ระบบ...</p>
      </div>
    </div>
  );
}
