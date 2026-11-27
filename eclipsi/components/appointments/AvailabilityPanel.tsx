import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { api } from '../../lib/api';
import { appointmentTime, errorMessage, jsonPost, listSlots, type Slot } from '../../lib/appointments';
import { palette } from '../../lib/palette';
import { Action, Feedback, styles } from './AppointmentUI';
import { DateTimeFields } from './DateTimeFields';

export function AvailabilityPanel({ professionalId }: { professionalId: number | string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    void listSlots(professionalId).then(
      result => { if (active) setSlots(result); },
      error => { if (active) { setFailed(true); setFeedback(errorMessage(error, 'Não foi possível carregar os horários.')); } },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [professionalId]);

  async function save(slotId?: string) {
    const when = new Date(`${date}T${time}:00`);
    if (!slotId && (!date || !time || !Number.isFinite(when.getTime()) || when <= new Date())) {
      setFeedback('Escolha uma data e um horário futuros.');
      return;
    }
    setBusy(true);
    setFeedback('');
    try {
      if (slotId) {
        await api(`/api/v1/professional/availability/${encodeURIComponent(slotId)}`, { method: 'DELETE' });
      } else {
        await api('/api/v1/professional/availability', jsonPost({ data_hora: when.toISOString() }));
        setDate('');
        setTime('');
      }
      setSlots(await listSlots(professionalId));
      setFailed(false);
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível atualizar os horários.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Minha Disponibilidade</Text>
      <Text style={styles.copy}>Os horários são exibidos no fuso deste dispositivo.</Text>
      <DateTimeFields date={date} time={time} onDate={setDate} onTime={setTime} />
      <Action icon="add-circle-outline" label="Adicionar horário" onPress={() => save()} disabled={busy || loading} />
      <Feedback>{feedback}</Feedback>
      {loading ? <ActivityIndicator color={palette.indigo} accessibilityLabel="Carregando disponibilidade" /> : (
        !failed && (slots.length ? slots.map(slot => (
          <View key={slot.id} style={[styles.options, { alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={styles.copy}>{appointmentTime(slot.data_hora)}</Text>
            <Action icon="remove-circle-outline" label="Remover horário" onPress={() => save(slot.id)} disabled={busy} />
          </View>
        )) : <Text style={styles.copy}>Nenhum horário livre cadastrado.</Text>)
      )}
    </View>
  );
}
