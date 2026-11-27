export function professionalRegistration(registro?: string | null, uf?: string | null, specialty?: string | null) {
  const registration = registro?.trim();
  if (!registration) return undefined;

  const normalized = specialty?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const council = normalized?.startsWith('psiquiatr') ? 'CRM'
    : normalized?.startsWith('psicolog') || normalized?.startsWith('neuropsicolog') ? 'CRP'
    : undefined;
  const labeled = council && /^\d/.test(registration) ? `${council} ${registration}` : registration;
  return [labeled, uf?.trim().toUpperCase()].filter(Boolean).join(' · ');
}
