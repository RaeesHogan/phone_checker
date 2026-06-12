import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก")
  .max(15, "เบอร์โทรศัพท์ยาวเกินไป")
  .refine((val) => /^[0-9+-\s]+$/.test(val), "เบอร์โทรศัพท์ต้องประกอบด้วยตัวเลขเท่านั้น");

export const reservationSchema = z.object({
  customerName: z.string().min(2, "ชื่อลูกค้าต้องมีอย่างน้อย 2 ตัวอักษร"),
  phoneNumber: phoneSchema,
  address: z.string().min(5, "กรุณากรอกที่อยู่ที่ชัดเจน"),
  productCode: z.string().min(1, "กรุณากรอกรหัสสินค้า"),
  notes: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const loginSchema = z.object({
  username: z.string().min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export type LoginInput = z.infer<typeof loginSchema>;
