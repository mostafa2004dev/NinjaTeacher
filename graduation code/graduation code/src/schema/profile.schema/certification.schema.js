import { z } from "zod";

export const certificationSchema = z.object({
  certifications: z
    .array(z.string().min(3, "Certification required"))
    .min(1, "Add at least one certification"),
});