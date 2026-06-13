import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Users, UserPlus, ArrowLeft, Shield, User as UserIcon, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import Link from "next/link";
import UserActionMenu from "@/components/features/UserActionMenu";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>กลับหน้า Admin Management</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">จัดการผู้ใช้งาน</h1>
              <p className="text-slate-500 font-medium mt-1">จัดการบัญชีเจ้าหน้าที่และกำหนดสิทธิ์การเข้าถึงระบบ</p>
            </div>
          </div>
          
          <Link 
            href="/admin/users/new" 
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10"
          >
            <UserPlus className="w-5 h-5" />
            <span>เพิ่มเจ้าหน้าที่ใหม่</span>
          </Link>
        </div>

        {/* User Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    ชื่อ-นามสกุล / ข้อมูลบัญชี
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    บทบาท (Role)
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    สถานะบัญชี
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    วันที่เข้าร่วม
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100 text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.fullName}</span>
                          <span className="text-sm font-mono text-slate-400">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.role === 'ADMIN' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Shield className="w-3 h-3" />
                          <span>ADMINISTRATOR</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                          <span>STAFF USER</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {user.active ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ใช้งานปกติ</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm italic">
                          <XCircle className="w-4 h-4" />
                          <span>ถูกระงับการใช้งาน</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-500">
                        {format(new Date(user.createdAt), "d MMMM yyyy", { locale: th })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <UserActionMenu user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">
              ไม่พบข้อมูลผู้ใช้งานในระบบ
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-sm text-slate-400 font-medium italic">
            * สิทธิ์ระดับ Admin สามารถเข้าถึงข้อมูลลูกค้าทั้งหมดและระบบส่งออกไฟล์ได้
          </p>
          <div className="text-sm font-bold text-slate-500">
            จำนวนทั้งหมด {users.length} บัญชี
          </div>
        </div>
      </div>
    </div>
  );
}
