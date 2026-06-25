import * as zod from 'zod'


export const registerschema = zod.object({
  name: zod.string().nonempty('name is required').min(3, 'min length 3 char').max(15, 'max length is 15 char'),
  username: zod.string().nonempty('name is required').min(3, 'min length 3 char').max(15, 'max length is 15 char'),
  email: zod.email("invalid mail"),
  dateOfBirth: zod.coerce.date()
    .refine(function name(value) {
      return new Date().getFullYear() - value.getFullYear() >= 16 ? true : false
    }, 'age must be above 16'),
  
  gender: zod.enum(['male', 'female'], " GenderRequired "),
  password: zod.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, 'invalid password'),
  rePassword: zod.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, 'invalid password'),


}).refine(function (data) {
  return data.password === data.rePassword ? true : false

}, { message: "password are not match", path: ["rePassword"] })

