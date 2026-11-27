import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { api, ApiError } from '../../lib/api';
import { appointmentTime, currency, errorMessage, jsonPost, listSlots, type Slot, type Specialist } from '../../lib/appointments';
import { palette } from '../../lib/palette';
import { Action, AppointmentModal, Choice, Feedback, styles } from './AppointmentUI';

export function BookingModal({ doctor, onClose, onBooked }: {
  doctor: Specialist; onClose: () => void; onBooked: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    void listSlots(doctor.id).then(
      result => { if (active) setSlots(result); },
      error => { if (active) { setFailed(true); setFeedback(errorMessage(error, 'Não foi possível carregar a grade.')); } },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor.id]);

  async function book() {
    setSaving(true);
    setFeedback('');
    try {
      await api('/api/v1/patient/appointments', jsonPost({ slot_id: selected }));
      onBooked();
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível agendar.'));
      if (error instanceof ApiError && error.status === 409) {
        setSelected('');
        setSlots([]);
        try {
          setSlots(await listSlots(doctor.id));
        } catch (refreshError) {
          setFailed(true);
          setFeedback(errorMessage(refreshError, 'Não foi possível recarregar a grade.'));
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppointmentModal title={doctor.nome} onClose={() => { if (!saving) onClose(); }}>
      <Text style={styles.label}>{doctor.especialidade}</Text>
      {doctor.registro && <Text style={styles.copy}>{doctor.registro}{doctor.uf ? ` · ${doctor.uf}` : ''}</Text>}
      {doctor.descricao && <Text style={styles.copy}>{doctor.descricao}</Text>}
      {doctor.valor_hora != null && <Text style={styles.label}>{currency.format(doctor.valor_hora)} por sessão</Text>}
      {loading ? <ActivityIndicator color={palette.indigo} accessibilityLabel="Carregando horários" /> : (
        !failed && (slots.length ? (
          <>
            <Text style={styles.label}>Horários livres</Text>
            <View style={styles.options}>
              {slots.map(slot => <Choice key={slot.id} label={appointmentTime(slot.data_hora)}
                selected={selected === slot.id} onPress={() => { if (!saving) setSelected(slot.id); }} />)}
            </View>
          </>
        ) : <Text style={styles.copy}>Este profissional não possui horários livres no momento.</Text>)
      )}
      <Feedback>{feedback}</Feedback>
      {!!slots.length && <Action icon="calendar-outline" label={saving ? 'Agendando…' : 'Confirmar agendamento'}
        onPress={book} disabled={!selected || saving} />}
    </AppointmentModal>
  );
}
