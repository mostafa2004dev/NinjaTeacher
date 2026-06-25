import { z } from "zod";

export const contactSchema = z.object({
  role: z.string().min(1, "Please select your role"),

  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .trim(),

  email: z
    .string()
    .email("Please enter a valid email")
    .trim(),

  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .trim(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .trim(),
});