"use client";

import { useState } from "react";
import { 
  toggleUserStatus, 
  deleteUser, 
  resetUserPassword, 
  updateUserSettings 
} from "@/app/actions/user";
import { 
  MoreVertical, 
  KeyRound, 
  UserCog, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Loader2, 
  X,
  Shield,
  User as UserIcon,
  Save
} from "lucide-react";

export default function UserActionMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"edit" | "password" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleStatus = async () => {
    if (confirm(`ต้องการ ${user.active ? 'ระงับ' : 'เปิด'} การใช้งานของ ${user.fullName}?`)) {
      setLoading(true);
      await toggleUserStatus(user.id, user.active);
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteUser(user.id);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
    } else {
      setModalType(null);
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (formData: FormData) => {
    setLoading(true);
    const result = await updateUserSettings(user.id, formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setModalType(null);
      setLoading(false);
    }
  };

  const handleResetPassword = async (formData: FormData) => {
    setLoading(true);
    const result = await resetUserPassword(user.id, formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      alert("รีเซ็ตรหัสผ่านสำเร็จ");
      setModalType(null);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <button 
                onClick={() => { setModalType("edit"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
              >
                <UserCog className="w-4 h-4" />
                <span>แก้ไขข้อมูล</span>
              </button>
              <button 
                onClick={() => { setModalType("password"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>เปลี่ยนรหัสผ่าน</span>
              </button>
              <button 
                onClick={handleToggleStatus}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  user.active 
                  ? 'text-slate-700 hover:bg-red-50 hover:text-red-600' 
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                {user.active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span>{user.active ? 'ระงับการใช้งาน' : 'เปิดการใช้งาน'}</span>
              </button>
              <div className="h-[1px] bg-slate-100 my-1" />
              <button 
                onClick={() => { setModalType("delete"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบบัญชีถาวร</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {modalType === "edit" && "แก้ไขข้อมูลผู้ใช้"}
                {modalType === "password" && "เปลี่ยนรหัสผ่าน"}
                {modalType === "delete" && "ยืนยันการลบ"}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {modalType === "edit" && (
                <form action={handleUpdateInfo} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ชื่อ-นามสกุล</label>
                    <input 
                      name="fullName" 
                      defaultValue={user.fullName} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">บทบาท (Role)</label>
                    <select 
                      name="role" 
                      defaultValue={user.role}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    >
                      <option value="USER">Staff User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </button>
                </form>
              )}

              {modalType === "password" && (
                <form action={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">รหัสผ่านใหม่</label>
                    <input 
                      name="password" 
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
                    {loading ? <Loader2 className="animate-spin" /> : <KeyRound className="w-5 h-5" />}
                    <span>เปลี่ยนรหัสผ่าน</span>
                  </button>
                </form>
              )}

              {modalType === "delete" && (
                <div className="space-y-8 text-center">
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex flex-col items-center gap-4">
                    <Trash2 className="w-12 h-12 text-red-500" />
                    <p className="text-slate-600 font-medium">
                      คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี <br/>
                      <span className="font-black text-red-600">@{user.username} ({user.fullName})</span> <br/>
                      ออกจากระบบอย่างถาวร?
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setModalType(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                      ยกเลิก
                    </button>
                    <button onClick={handleDelete} disabled={loading} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                      {loading ? <Loader2 className="animate-spin" /> : "ยืนยันการลบ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
