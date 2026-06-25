import { z } from "zod";

export const basicInfoSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  location: z.string().min(2, "Location is required"),
  phone: z.string().min(10, "Phone is required"),
  experience: z.string().min(1, "Experience is required"),
  bio: z.string().max(500).optional(),
});