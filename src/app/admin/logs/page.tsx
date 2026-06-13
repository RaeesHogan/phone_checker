import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { History, ArrowLeft, Clock, User, Activity, FileJson } from "lucide-react";
import Link from "next/link";

export default async function AdminLogsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
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
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-xl shadow-emerald-600/20">
            <History className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">บันทึกกิจกรรม (Audit Logs)</h1>
            <p className="text-slate-500 font-medium mt-1">ติดตามความเคลื่อนไหวและการเปลี่ยนแปลงข้อมูลทั้งหมดในระบบ</p>
          </div>
        </div>

        {/* Logs Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    วัน-เวลา
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    ผู้ดำเนินการ
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    กิจกรรม (Action)
                  </th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-100">
                    รายละเอียดข้อมูล
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span className="font-mono">{format(new Date(log.createdAt), "dd/MM/yy HH:mm:ss")}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700">{log.user?.fullName || "SYSTEM"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">
                        <Activity className="w-3 h-3" />
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2 max-w-md">
                        <FileJson className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                        <code className="text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {JSON.stringify(log.details)}
                        </code>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {logs.length === 0 && (
            <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center gap-4">
              <History className="w-12 h-12 opacity-10" />
              <p>ยังไม่มีบันทึกกิจกรรมในฐานข้อมูล</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-sm text-slate-400 font-medium">
            * แสดงข้อมูลล่าสุดสูงสุด 50 รายการ
          </p>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-lg">
            Audit Trail
          </div>
        </div>
      </div>
    </div>
  );
}
