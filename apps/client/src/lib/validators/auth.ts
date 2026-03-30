import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis').max(200),
});

export const RegisterSchema = z.object({
  username: z.string().trim().min(3, 'Pseudo trop court').max(30, 'Pseudo trop long'),
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court').max(200),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
