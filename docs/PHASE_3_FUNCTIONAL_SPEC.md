# Phase 3: Functional Specification

## 1. Public Search Module
- **Endpoint:** `GET /api/search?phone=[number]`
- **Input:** เบอร์โทรศัพท์ (จะถูก Normalize ก่อนค้นหา)
- **Logic:**
    1. รับเบอร์โทรศัพท์ -> ตัดอักขระพิเศษ -> แปลงรูปแบบให้เป็น 0XXXXXXXXX
    2. ค้นหาในตาราง `reservations` ที่มี `phone_number` ตรงกัน และ `status = 'ACTIVE'`
- **Output:**
    - หากพบ: ส่งคืนสถานะ `found` (แสดงผลหน้าจอ: "มีการจองแล้ว")
    - หากไม่พบ: ส่งคืนสถานะ `not_found` (แสดงผลหน้าจอ: "ยังไม่มีการจอง")
- **Security:** ไม่ส่งคืนข้อมูลลูกค้า (Name, Address, etc.) ไปยังฝั่ง Client ในโมดูลนี้เด็ดขาด

## 2. Authentication & Authorization
- **Technology:** Auth.js (NextAuth v5)
- **Roles:** PUBLIC, USER, ADMIN
- **Security:** 
    - Argon2 สำหรับการเก็บ Password Hash
    - Middleware ป้องกันการเข้าถึงหน้าภายในหากไม่ได้ล็อกอิน
    - Session หมดอายุอัตโนมัติใน 8 ชั่วโมง

## 3. Reservation Management Module
### 3.1 การสร้างการจอง (Create)
- **สิทธิ์:** USER, ADMIN
- **กระบวนการ:**
    1. ตรวจสอบสถานะเบอร์โทรศัพท์ (ต้องไม่มี ACTIVE reservation)
    2. บันทึกข้อมูล: `customer_name`, `phone_number`, `address`, `product_code`, `notes`
    3. ระบบคำนวณอัตโนมัติ:
        - `reservation_date`: วันที่ปัจจุบัน
        - `expiration_date`: `reservation_date` + 14 วัน
        - `status`: 'ACTIVE'
        - `created_by`: ID ของผู้ใช้งานปัจจุบัน

### 3.2 การอัปเดตและยกเลิก (Update/Cancel)
- **สิทธิ์:** เจ้าของการจอง (Owner) หรือ ADMIN
- **สถานะ:** 
    - เปลี่ยนเป็น `CANCELLED` (ยกเลิกด้วยมือ)
    - เปลี่ยนเป็น `EXPIRED` (ระบบเปลี่ยนให้อัตโนมัติ)

### 3.3 ระบบหมดอายุอัตโนมัติ (Auto-Expiration)
- **Scheduled Job:** รันทุกวันเวลา 00:00 น.
- **Logic:** ค้นหาการจองที่มี `status = 'ACTIVE'` และ `expiration_date <= current_date` แล้วเปลี่ยนเป็น `EXPIRED`

## 4. Dashboard Module
- **Metrics:**
    - จำนวนการจองทั้งหมด (Total)
    - แบ่งตามสถานะ (Active, Expired, Cancelled)
    - สถิติรายวัน/รายเดือน
- **Visuals:** กราฟเส้นแสดงแนวโน้มการจองในแต่ละวัน

## 5. User Management Module (Admin Only)
- สร้างบัญชีผู้ใช้ใหม่ (พนักงาน)
- เปิด/ปิด การใช้งานบัญชี (Enable/Disable)
- รีเซ็ตรหัสผ่าน

## 6. Export Excel Module
- **Library:** `exceljs`
- **Fields:** ทุกฟิลด์ในตาราง Reservations รวมถึงผู้สร้างและวันที่หมดอายุ
- **Streaming:** รองรับการดึงข้อมูลขนาดใหญ่เพื่อป้องกัน Memory Leak

## 7. Logging & Monitoring
### 7.1 Audit Logging
- บันทึกทุก Action สำคัญ: `LOGIN`, `CREATE_RESERVATION`, `CANCEL_RESERVATION`, `EXPORT_DATA`
- บันทึก IP Address และ User Agent

### 7.2 System Logging
- บันทึก Error ที่เกิดขึ้นในระบบ (API Errors, Database Errors) พร้อม Stack Trace

### 7.3 Health Check
- Endpoint: `/api/health` สำหรับตรวจสอบสถานะ Database และ API

## 8. Settings Management
- จัดการค่าพื้นฐานในตาราง `settings` เช่น `RESERVATION_EXPIRE_DAYS` (Default: 14)
