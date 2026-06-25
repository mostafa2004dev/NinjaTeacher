import { z } from "zod";

export const experienceSchema = z.object({
  jobs: z
    .array(
      z.object({
        title: z.string().min(2, "Job title required"),
        school: z.string().min(2, "School required"),
        period: z.string().min(2, "Period required"),
      })
    )
    .min(1, "Add at least one job"),
});