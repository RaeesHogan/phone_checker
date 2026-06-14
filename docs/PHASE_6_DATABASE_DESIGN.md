# Phase 6: Database Design

## 1. Entity Relationship Diagram (Logical)
- **User** (1) <--- (N) **Reservation** (สร้างโดย)
- **User** (1) <--- (N) **AuditLog** (กระทำโดย)
- **Reservation** (1) <--- (N) **AuditLog** (เกี่ยวกับ)

## 2. Prisma Schema (Draft)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  USER
}

enum Status {
  ACTIVE
  EXPIRED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  passwordHash  String
  fullName      String
  role          Role      @default(USER)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  reservations  Reservation[]
  auditLogs     AuditLog[]
}

model Reservation {
  id              String    @id @default(cuid())
  customerName    String
  phoneNumber     String    // Normalized: 0XXXXXXXXX
  address         String
  productCode     String
  notes           String?
  status          Status    @default(ACTIVE)
  reservationDate DateTime  @default(now())
  expirationDate  DateTime
  
  createdBy       String
  user            User      @relation(fields: [createdBy], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([phoneNumber])
  @@index([status])
  @@index([expirationDate])
}

model AuditLog {
  id          String    @id @default(cuid())
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  action      String    // e.g., CREATE_RESERVATION, LOGIN
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
}

model SystemLog {
  id          String    @id @default(cuid())
  level       String    // INFO, WARNING, ERROR, CRITICAL
  source      String    // e.g., API_ROUTE, CRON_JOB
  message     String
  stackTrace  String?
  requestId   String?
  createdAt   DateTime  @default(now())
}

model Setting {
  id          String    @id @default(cuid())
  key         String    @unique
  value       String
  updatedAt   DateTime  @updatedAt
}
```

## 3. SQL Constraints & Index Strategy
### 3.1 Concurrency Protection (CRITICAL)
เราจะใช้ **PostgreSQL Partial Unique Index** เพื่อรับประกันว่าจะไม่มีการจองที่สถานะ `ACTIVE` ซ้ำกันสำหรับเบอร์โทรศัพท์เดิม:
```sql
CREATE UNIQUE INDEX unique_active_reservation 
ON "Reservation" (phone_number) 
WHERE status = 'ACTIVE';
```

### 3.2 Performance Indexing
- **phoneNumber:** เพื่อความเร็วในหน้า Public Search
- **status & expirationDate:** เพื่อความเร็วของ Cron Job ในการค้นหาการจองที่หมดอายุ
- **createdBy:** เพื่อความเร็วในการแสดงผล "การจองของฉัน"

## 4. Data Retention & Expiration Strategy
- **Soft Delete:** ไม่มีการลบข้อมูลจากตาราง `Reservation` แต่จะเปลี่ยนสถานะเป็น `CANCELLED`
- **Auto-Expiration:** ระบบจะตรวจสอบ `expirationDate` และอัปเดต `status` เป็น `EXPIRED`
- **Audit Logs:** ข้อมูลจะถูกเก็บไว้อย่างน้อย 1 ปี (หรือตามนโยบายบริษัท)

## 5. Normalization Utility (SQL/App Level)
ก่อนบันทึก `phoneNumber` ลงฐานข้อมูล ระบบต้องทำความสะอาดข้อมูลเสมอ:
1. ลบอักขระที่ไม่ใช่ตัวเลข
2. เปลี่ยน `+66` หรือ `66` นำหน้าให้เป็น `0`
3. บันทึกในรูปแบบความยาว 10 หลัก (0XXXXXXXXX)
