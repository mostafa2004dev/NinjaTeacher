import { z } from "zod";

export const educationSchema = z.object({
  education: z
    .array(
      z.object({
        degree: z.string().min(2, "Degree required"),
        institution: z.string().min(2, "Institution required"),
        year: z.string().min(2, "Year required"),
      })
    )
    .min(1, "Add at least one education"),
});