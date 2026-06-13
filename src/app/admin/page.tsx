import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  History, 
  Settings, 
  FileDown, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const menuItems = [
    {
      title: "จัดการผู้ใช้",
      subtitle: "User Management",
      description: "เพิ่ม แก้ไข หรือปิดใช้งานบัญชีเจ้าหน้าที่ในระบบ",
      href: "/admin/users",
      icon: Users,
      color: "blue"
    },
    {
      title: "บันทึกกิจกรรม",
      subtitle: "Audit Logs",
      description: "ตรวจสอบประวัติการทำงานและกิจกรรมต่างๆ ในระบบ",
      href: "/admin/logs",
      icon: History,
      color: "emerald"
    },
    {
      title: "ตั้งค่าระบบ",
      subtitle: "System Settings",
      description: "จัดการวันหมดอายุการจอง และการตั้งค่าพื้นฐานของระบบ",
      href: "/admin/settings",
      icon: Settings,
      color: "indigo"
    },
    {
      title: "ส่งออกข้อมูล",
      subtitle: "Excel Export",
      description: "ดาวน์โหลดข้อมูลการจองทั้งหมดเป็นไฟล์ Excel (.xlsx)",
      href: "/api/admin/export",
      icon: FileDown,
      color: "amber",
      isExternal: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb / Back */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>กลับหน้า Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-900/10">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Management</h1>
              <p className="text-slate-500 font-medium mt-1">ยินดีต้อนรับผู้ดูแลระบบ: <span className="text-slate-900">{session.user?.name}</span></p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const CardWrapper = item.isExternal ? 'a' : Link;
            const colorClasses = {
              blue: "group-hover:bg-blue-600 group-hover:text-white text-blue-600 bg-blue-50",
              emerald: "group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 bg-emerald-50",
              indigo: "group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 bg-indigo-50",
              amber: "group-hover:bg-amber-600 group-hover:text-white text-amber-600 bg-amber-50"
            }[item.color as keyof typeof colorClasses];

            const borderClasses = {
              blue: "hover:border-blue-200",
              emerald: "hover:border-emerald-200",
              indigo: "hover:border-indigo-200",
              amber: "hover:border-amber-200"
            }[item.color as keyof typeof borderClasses];

            return (
              <CardWrapper
                key={item.title}
                href={item.href}
                {...(item.isExternal ? { download: true } : {})}
                className={`flex items-start gap-6 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${borderClasses}`}
              >
                <div className={`p-4 rounded-2xl transition-colors duration-300 shrink-0 ${colorClasses}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.title}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-500 mt-4 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 Admin Control Panel &bull; System Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
