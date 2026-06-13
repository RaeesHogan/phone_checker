"use client";

import { createUser } from "@/app/actions/user";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, User, KeyRound, Shield, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const result = await createUser(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("สร้างบัญชีเจ้าหน้าที่สำเร็จแล้ว");
      router.push("/admin/users");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>กลับไปหน้ารายชื่อ</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-900/10">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">เพิ่มเจ้าหน้าที่ใหม่</h1>
            <p className="text-slate-500 font-medium mt-1">สร้างบัญชีผู้ใช้งานใหม่สำหรับพนักงานในระบบ</p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">ชื่อ-นามสกุลจริง</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="เช่น นายมานะ ใจดี"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">ชื่อผู้ใช้ (Username)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <span className="text-lg font-bold">@</span>
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="mana_staff"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">รหัสผ่านเริ่มต้น</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">บทบาทหน้าที่ (Role)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <select
                  name="role"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all outline-none appearance-none"
                >
                  <option value="USER">Staff User (พนักงานทั่วไป)</option>
                  <option value="ADMIN">Administrator (ผู้ดูแลระบบ)</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-blue-600/20 text-lg"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>สร้างบัญชีเจ้าหน้าที่</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
