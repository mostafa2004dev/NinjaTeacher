import * as zod from 'zod'


export const Loginschema = zod.object({

    email: zod.email("invalid mail"),
    password: zod.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, 'invalid password'),



})

