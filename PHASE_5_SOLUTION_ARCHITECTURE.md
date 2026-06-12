# Phase 5: Solution Architecture

## 1. High-Level Architecture
ระบบถูกออกแบบภายใต้สถาปัตยกรรม **Modern Full-Stack Next.js** โดยเน้นการทำงานแบบ Server-Side First เพื่อความปลอดภัยและประสิทธิภาพ

- **Frontend:** Next.js 15 (App Router) + React + TailwindCSS + shadcn/ui
- **API Layer:** Server Actions (สำหรับการจัดการ Form/Data) และ Route Handlers (สำหรับ REST API เช่น Public Search และ Health Check)
- **Authentication:** Auth.js (NextAuth v5) สำหรับการจัดการ Session และ RBAC
- **Database Layer:** Prisma ORM เชื่อมต่อกับ PostgreSQL (Supabase/Local)
- **Background Jobs:** Vercel Cron Jobs สำหรับการจัดการ Expiration อัตโนมัติ

## 2. Component Interaction Diagram (Logical)
1. **Public Search:** `Browser` -> `Route Handler (/api/search)` -> `Prisma` -> `PostgreSQL`
2. **Staff Reservation:** `Browser` -> `NextAuth Middleware` -> `Server Action` -> `Prisma` -> `PostgreSQL` -> `Audit Log Creation`
3. **Daily Expiration:** `Vercel Cron` -> `Secure Route Handler` -> `Prisma Update Many` -> `System Log Creation`

## 3. Data Flow & Security Gates
- **Gate 1: Public Access:** อนุญาตเฉพาะ GET request ที่ `/api/search` โดยจำกัดฟิลด์ที่ส่งคืน
- **Gate 2: Middleware:** ตรวจสอบ JWT Session สำหรับทุกเส้นทางที่ขึ้นต้นด้วย `/dashboard` หรือ `/admin`
- **Gate 3: RBAC Action:** ภายใน Server Actions จะมีการตรวจสอบ Role (`USER` หรือ `ADMIN`) ก่อนดำเนินการกับฐานข้อมูล
- **Gate 4: Database Constraints:** ใช้ Unique Index เพื่อเป็นด่านสุดท้ายป้องกันการจองซ้ำ

## 4. Infrastructure Strategy
- **Development Environment:** 
    - Node.js 24+
    - Docker Compose (PostgreSQL)
    - Local Environment Variables (`.env`)
- **Production Environment (Vercel):**
    - Serverless Functions (Next.js)
    - Managed PostgreSQL (Supabase)
    - Connection Pooling (Transaction Mode - Port 6543)

## 5. Logging & Observability Architecture
- **Structured Logs:** ใช้ JSON format บันทึกลงตาราง `system_logs` ในฐานข้อมูล
- **Request Tracing:** ใช้ `request_id` เชื่อมโยง Audit Log และ System Log เพื่อให้ AI ช่วยวิเคราะห์ปัญหาได้ง่าย
- **Health Monitoring:** API `/api/health` สำหรับตรวจสอบสถานะ DB Connection และ Uptime

## 6. Technology Summary Table
| Layer | Technology | Key Reason |
| :--- | :--- | :--- |
| Framework | Next.js 15 | Unified frontend/backend, SSR, Optimized performance |
| Language | TypeScript | Type safety, Better maintainability |
| Database | PostgreSQL | ACID compliance, Conditional Unique Index support |
| ORM | Prisma | Type-safe queries, Automated migrations |
| Auth | Auth.js v5 | Seamless Next.js integration, Secure by default |
| Styling | TailwindCSS | Rapid UI development, Consistency |
