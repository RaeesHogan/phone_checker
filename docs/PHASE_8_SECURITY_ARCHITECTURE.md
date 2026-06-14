# Phase 8: Security Architecture

## 1. Authentication & Identity
- **Password Hashing:** ใช้ **Argon2id** (พารามิเตอร์: memory=64MB, iterations=3, parallelism=4) ซึ่งเป็นมาตรฐานสูงสุดในปัจจุบัน
- **Session Management:**
    - ใช้ **Auth.js (NextAuth v5)**
    - Session Strategy: `jwt`
    - Timeout: **8 ชั่วโมง** (Default)
    - Refresh Strategy: ต่ออายุเซสชันทุกครั้งที่มีกิจกรรม
- **Multi-Factor Authentication (MFA):** (Optional/Future) ออกแบบรองรับการเพิ่ม TOTP ในอนาคต

## 2. Authorization (RBAC)
- **Roles:** `PUBLIC`, `USER`, `ADMIN`
- **Enforcement Levels:**
    - **Middleware Level:** ป้องกันการเข้าถึง Route ต่างๆ ตาม Session และ Role
    - **Server Action Level:** ตรวจสอบสิทธิ์ซ้ำอีกครั้งก่อนเข้าถึงฐานข้อมูล
    - **Database Level:** (Optional) Row Level Security (RLS) หากใช้ Supabase

## 3. Web Security (OWASP Protections)
- **CSRF Protection:** ใช้ Next.js Built-in CSRF protection (ผ่าน Server Actions และ Secure Cookies)
- **XSS Prevention:** 
    - React ทำการ Escape ข้อมูลอัตโนมัติ
    - ใช้ Content Security Policy (CSP) ที่เข้มงวด
- **SQL Injection:** ป้องกัน 100% ผ่านการใช้ **Prisma ORM** (Parameterized Queries)
- **Secure Headers:** ตั้งค่า `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`

## 4. Input Validation & Data Integrity
- **Zod Schema Validation:** ตรวจสอบข้อมูลขาเข้าทุกอย่าง (Request Body/Params)
- **Data Normalization:** ทำความสะอาดข้อมูลเบอร์โทรศัพท์ก่อนตรวจสอบและบันทึก
- **Sanitization:** กรอง HTML Tags และอักขระพิเศษในฟิลด์บันทึกข้อความ

## 5. Rate Limiting
- **Public Search:** จำกัดที่ 10 ครั้งต่อนาทีต่อ IP
- **Login Attempts:** จำกัดที่ 5 ครั้งต่อ 15 นาทีต่อ User (เพื่อป้องกัน Brute Force)
- **Implementation:** ใช้ `upstash/ratelimit` (Redis) หรือ In-memory cache สำหรับ Vercel

## 6. Logging & Audit Security
- **PII Protection:** ห้ามบันทึกชื่อลูกค้าหรือเบอร์โทรศัพท์แบบเต็มลงใน System Logs (ให้ใช้ Partial Masking ใน Log หากจำเป็น)
- **Immutable Audit Logs:** บันทึกกิจกรรมการแก้ไขข้อมูลที่สำคัญ โดยห้ามผู้ใช้งาน (แม้แต่ Admin) แก้ไขบันทึกนี้
- **Request ID:** ทุก Log ต้องมี Request ID เพื่อการตรวจสอบย้อนกลับ (Traceability)

## 7. Network Security
- **HTTPS:** บังคับใช้งาน TLS 1.3 เท่านั้น
- **CORS:** จำกัดเฉพาะโดเมนที่ได้รับอนุญาตเท่านั้น
- **Cron Security:** ใช้ `CRON_SECRET` ใน Header สำหรับการเรียก API หลังบ้าน
