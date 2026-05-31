import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Пароль не короче ${PASSWORD_MIN_LENGTH} символов`)
  .max(200)
  .refine((v) => /[A-Za-zА-Яа-яЁё]/.test(v) && /\d/.test(v), {
    message: "Пароль должен содержать хотя бы одну букву и одну цифру",
  });

export const PASSWORD_HINT = `от ${PASSWORD_MIN_LENGTH} символов, буква и цифра`;
