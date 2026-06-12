# Phase 4: UX/UI Design

## 1. Design Principles
- **Clean & Minimal:** ใช้พื้นที่ว่าง (Whitespace) อย่างเหมาะสม ลดสิ่งรบกวน
- **shadcn/ui Based:** ใช้ส่วนประกอบมาตรฐาน เช่น Card, Button, Input, Table จาก shadcn/ui
- **Mobile First:** หน้าจอต้องใช้งานได้ดีเยี่ยมบนสมาร์ทโฟน (โดยเฉพาะการค้นหาและการกรอกฟอร์ม)
- **High Contrast Status:** ใช้สีที่ชัดเจนสำหรับสถานะ (แดง = จองแล้ว, เขียว = ว่าง)

## 2. Information Architecture
- **Public Area:**
    - Home (Search)
- **Authenticated Area:**
    - Sidebar Navigation (สำหรับจอใหญ่) / Bottom Nav หรือ Hamburger Menu (สำหรับมือถือ)
    - Reservations List (My Reservations)
    - Create Reservation (Form)
- **Admin Area:**
    - Dashboard (Overview)
    - Global Reservation Management
    - User Management
    - Logs (Audit & System)
    - Settings

## 3. User Flows
### 3.1 Public Search Flow
`Entry -> Phone Input -> Search Button -> Status View -> [If Empty] Login Link`

### 3.2 Staff Reservation Flow
`Login -> Dashboard -> Search Phone -> [If Not Found] Create Button -> Fill Form -> Submit -> Success View`

## 4. Wireframes (Descriptions)

### 4.1 Home Page (Public Search)
- **Top:** Logo "Reservation Lock"
- **Center:** กล่อง Input ขนาดใหญ่ "กรอกเบอร์โทรศัพท์"
- **Button:** "ตรวจสอบสถานะ" (สีน้ำเงิน)
- **Result Area:** (แสดงหลังจากค้นหา) Card สีเขียว/แดง พร้อมข้อความสถานะใหญ่ชัดเจน

### 4.2 Dashboard (Staff/Admin)
- **Top:** สรุปตัวเลข (Cards) - จองทั้งหมด, กำลังจะหมดอายุ, ใช้งานอยู่
- **Center:** ตาราง "การจองล่าสุด" 5 รายการแรก
- **Action:** ปุ่ม "สร้างการจองใหม่" (Floating Action Button สำหรับมือถือ)

### 4.3 Reservation Form
- **Field 1:** ชื่อ-นามสกุลลูกค้า (Input)
- **Field 2:** เบอร์โทรศัพท์ (Input - Read Only หากมาจากการค้นหา)
- **Field 3:** ที่อยู่ (Textarea)
- **Field 4:** รหัสสินค้า (Input)
- **Field 5:** หมายเหตุ (Textarea - Optional)
- **Footer:** ปุ่ม "บันทึกการจอง" และ "ยกเลิก"

### 4.4 Admin: Audit Logs
- **Header:** ตัวกรอง (Filter) ตามวันที่, ผู้ใช้, กิจกรรม
- **Body:** ตาราง (DataTable) แสดง ลำดับ, วันที่, ผู้ใช้, กิจกรรม, รายละเอียด

## 5. Navigation Structure
- **Desktop:** Sidebar ด้านซ้าย (Dashboard, My Reservations, All Reservations (Admin), Users (Admin), Logs (Admin), Settings)
- **Mobile:** Top Header พร้อม Hamburger Menu ด้านขวา

## 6. Color Palette (Theme)
- **Primary:** `#0F172A` (Slate 900)
- **Success:** `#22C55E` (Green 500)
- **Destructive:** `#EF4444` (Red 500)
- **Surface:** `#FFFFFF`
- **Border:** `#E2E8F0`
