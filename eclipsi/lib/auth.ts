import { api, ApiError } from './api';

export const profileRoutes = {
  admin: '/profile/admin',
  medico: '/profile/medico',
  paciente: '/profile/user',
} as const;

export type ProfileRole = keyof typeof profileRoutes;

export async function getVerifiedRole(token?: string): Promise<ProfileRole> {
  const session = await api<{ success?: boolean; user?: { role?: string; tipo?: string } } | null>(
    '/api/me',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  const value = session?.user?.role ?? session?.user?.tipo;
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (session?.success !== false) {
    if (role === 'admin') return 'admin';
    if (['medico', 'médico', 'profissional', 'professional', 'doctor'].includes(role)) return 'medico';
    if (['paciente', 'patient', 'user'].includes(role)) return 'paciente';
  }

  throw new ApiError('Não foi possível validar o perfil desta sessão.', 403);
}
