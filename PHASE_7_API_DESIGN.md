# Phase 7: API Design (OpenAPI 3.1 Specification)

## 1. Public Endpoints
### 1.1 Search Reservation
- **Route:** `GET /api/search`
- **Query Params:** `phone` (string, required)
- **Authorization:** None (Public)
- **Response:**
    - `200 OK`: `{ "status": "found" | "not_found" }`
    - `400 Bad Request`: `{ "error": "Invalid phone format" }`

### 1.2 Health Check
- **Route:** `GET /api/health`
- **Authorization:** None
- **Response:**
    - `200 OK`: `{ "status": "healthy", "database": "connected", "timestamp": "ISO8601" }`

## 2. Reservation Endpoints
### 2.1 List Reservations
- **Route:** `GET /api/reservations`
- **Query Params:** `page`, `limit`, `status`, `search`
- **Authorization:** Authenticated (`USER`, `ADMIN`)
- **Logic:** `USER` เห็นเฉพาะของตนเอง, `ADMIN` เห็นทั้งหมด
- **Response:** `200 OK`: `{ "data": [...], "pagination": {...} }`

### 2.2 Create Reservation
- **Route:** `POST /api/reservations`
- **Authorization:** Authenticated (`USER`, `ADMIN`)
- **Request Body:**
    ```json
    {
      "customerName": "string",
      "phoneNumber": "string",
      "address": "string",
      "productCode": "string",
      "notes": "string (optional)"
    }
    ```
- **Validation:** 
    - `customerName`: min 2 chars
    - `phoneNumber`: must be valid Thai format
- **Response:** `201 Created` or `409 Conflict` (หากเบอร์ซ้ำในสถานะ ACTIVE)

### 2.3 Cancel Reservation
- **Route:** `PATCH /api/reservations/{id}/cancel`
- **Authorization:** Authenticated (Owner or `ADMIN`)
- **Response:** `200 OK`: `{ "message": "Reservation cancelled" }`

## 3. Admin Endpoints
### 3.1 User Management
- **Routes:**
    - `GET /api/admin/users`: ดึงรายชื่อพนักงาน
    - `POST /api/admin/users`: สร้างพนักงานใหม่
    - `PATCH /api/admin/users/{id}`: เปิด/ปิดการใช้งาน หรือรีเซ็ตรหัสผ่าน
- **Authorization:** `ADMIN` only

### 3.2 Export Data
- **Route:** `GET /api/admin/export/reservations`
- **Query Params:** `status`, `startDate`, `endDate`
- **Authorization:** `ADMIN` only
- **Response:** File Stream (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### 3.3 Logs
- **Routes:**
    - `GET /api/admin/logs/audit`: ดูบันทึกกิจกรรม
    - `GET /api/admin/logs/system`: ดูบันทึกข้อผิดพลาดระบบ
- **Authorization:** `ADMIN` only

## 4. Background / System Endpoints
### 4.1 Process Expiration
- **Route:** `POST /api/cron/expire`
- **Authorization:** `CRON_SECRET` header validation
- **Logic:** อัปเดตการจองที่หมดอายุ
- **Response:** `200 OK`: `{ "processed": number }`

## 5. Global Error Responses
- `401 Unauthorized`: ยังไม่ได้เข้าสู่ระบบ
- `403 Forbidden`: ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้
- `404 Not Found`: ไม่พบข้อมูลที่ระบุ
- `422 Unprocessable Entity`: ข้อมูลที่ส่งมาไม่ผ่านการ Validation
- `429 Too Many Requests`: เรียก API เกินขีดจำกัด (Rate Limit)
- `500 Internal Server Error`: ข้อผิดพลาดที่ไม่คาดคิด
