# Phase 9: Development Plan

## 1. Project Folder Structure
```text
/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── (auth)/         # Login, Register pages
│   │   ├── (public)/       # Search page (Home)
│   │   ├── dashboard/      # Authenticated staff area
│   │   ├── admin/          # Admin management area
│   │   ├── api/            # Route Handlers (Health, Cron, Search)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/             # shadcn/ui shared components
│   │   ├── forms/          # Reusable form components
│   │   ├── layout/         # Navbar, Sidebar, Footer
│   │   └── features/       # Feature-specific components (SearchCard, ReservationTable)
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   ├── auth.ts         # Auth.js configuration
│   │   ├── utils.ts        # Helper functions (Normalization, Formatting)
│   │   └── validation.ts   # Zod schemas
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Data access layer (Server Actions)
│   └── types/              # TypeScript interfaces/types
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 2. Component Breakdown
- **Shared Components:** `Button`, `Input`, `Card`, `Badge`, `DataTable`, `Dialog` (shadcn/ui)
- **Features:**
    - `PublicSearchForm`: หน้าแรกสำหรับการค้นหาเบอร์
    - `ReservationForm`: ฟอร์มสร้าง/แก้ไขการจอง
    - `StatusBadge`: แสดงสีตามสถานะการจอง (Active/Expired/Cancelled)
    - `AuditLogViewer`: ตารางแสดงประวัติกิจกรรมสำหรับ Admin

## 3. Database Migration & Seed Plan
- **Migration:** ใช้ `npx prisma migrate dev` สำหรับการสร้างตารางและดัชนี (รวมถึง Partial Unique Index ผ่าน SQL)
- **Seed Data:**
    - สร้างบัญชี Admin เริ่มต้น (username: admin)
    - ตั้งค่าระบบเบื้องต้น (`RESERVATION_EXPIRE_DAYS = 14`)
    - ข้อมูลตัวอย่าง (Mock Reservations) สำหรับการทดสอบ UI

## 4. Implementation Order (Phase 10 Strategy)
1. **Setup:** ตั้งค่าโปรเจกต์, Prisma, และ Tailwind
2. **Database:** รัน Migration และ Seed ข้อมูล
3. **Auth:** ติดตั้ง Auth.js และ Middleware
4. **Public Feature:** ระบบค้นหาสาธารณะ (หน้าแรก)
5. **Staff Features:** ระบบจัดการการจอง (CRUD)
6. **Admin Features:** Dashboard, User Management, Logs
7. **Background Jobs:** ระบบ Auto-Expiration (Vercel Cron)
8. **Export:** ระบบส่งออก Excel

## 5. Environment Variables (`.env.example`)
```text
DATABASE_URL="postgresql://user:password@localhost:5432/db"
DIRECT_URL="postgresql://user:password@localhost:5432/db"
AUTH_SECRET="your-secret-key"
CRON_SECRET="your-cron-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 6. Deployment Workflow
- **Git Branching:** `main` (Production), `develop` (Staging)
- **Vercel Integration:** อัปเดตอัตโนมัติเมื่อมีการ Push ไปยัง Branch ที่กำหนด
- **Database Migrations:** รัน `prisma migrate deploy` เป็นส่วนหนึ่งของ Build Step บน Vercel
