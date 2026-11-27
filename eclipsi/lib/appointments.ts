import { api, ApiError } from './api';

export type Specialist = {
  id: number | string;
  nome: string;
  especialidade?: string;
  abordagem?: string;
  modalidade?: string;
  registro?: string;
  uf?: string;
  descricao?: string;
  valor_hora: number | null;
  foto?: string;
  compatibility_score?: number;
  match_reasons?: string[];
};

export type Slot = { id: string; data_hora: string };
export type PixPayment = {
  payment_id: string;
  consulta_id: number | string;
  valor: number;
  status: string;
  qr_code: string;
  qr_code_base64: string | null;
  mode: 'sandbox_mock' | 'mercadopago';
};

export const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function appointmentTime(date: string) {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function jsonPost(data: object): RequestInit {
  return { method: 'POST', body: JSON.stringify(data) };
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export async function listSpecialists() {
  const paths = ['/api/v1/patient/doctors/recommended', '/api/v1/patient/doctors', '/api/v1/doctors'];
  for (const path of paths) {
    try {
      const { doctors } = await api<{ doctors: Specialist[] }>(path);
      return [...doctors].sort((a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0));
    } catch (error) {
      if (!(error instanceof ApiError) || ![404, 405].includes(error.status) || path === paths.at(-1)) throw error;
    }
  }
  return [];
}

export async function listSlots(id: number | string) {
  const { slots } = await api<{ slots: Slot[] }>(`/api/v1/professionals/${encodeURIComponent(id)}/availability`);
  return slots;
}

export function createPix(appointmentId: number | string) {
  return api<PixPayment>('/api/v1/payments/pix/create', jsonPost({ consulta_id: appointmentId }));
}
