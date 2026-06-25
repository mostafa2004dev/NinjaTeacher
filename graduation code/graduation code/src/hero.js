import { heroui } from "@heroui/react";

export default heroui({
    theme: {
        extend: {
            colors: {
                primary: "#6d4cff",
                warning: "#6d4cff", // 👈 مهم جدًا (يلغي الأصفر)
            },
        },
    },
});