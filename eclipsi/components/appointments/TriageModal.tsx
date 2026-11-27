import { useState } from 'react';
import { Text, View } from 'react-native';

import { api } from '../../lib/api';
import { errorMessage, jsonPost } from '../../lib/appointments';
import { FormInput } from '../FormInput';
import { Action, AppointmentModal, Choice, Feedback, styles } from './AppointmentUI';

const questions = [
  { key: 'motivo_principal', label: 'Que profissional você procura?', options: ['Psicólogo(a)', 'Psiquiatra', 'Psicanalista', 'Neuropsicólogo(a)'] },
  { key: 'abordagem_preferida', label: 'Abordagem preferida', options: ['TCC', 'Psicanálise', 'Humanista', 'Psiquiatria'] },
  { key: 'modalidade', label: 'Modalidade', options: ['online', 'presencial', 'híbrida'] },
  { key: 'urgencia', label: 'Urgência', options: ['normal', 'alta'] },
] as const;

type QuestionKey = typeof questions[number]['key'];

export function TriageModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> }) {
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function save() {
    const amount = Number(budget.trim().replace(',', '.'));
    if (questions.some(({ key }) => !answers[key]) || !Number.isFinite(amount) || amount <= 0 || amount > 999999) {
      setFeedback('Responda a todas as opções e informe um orçamento válido.');
      return;
    }
    setSaving(true);
    setFeedback('');
    try {
      await api('/api/v1/patient/triage', jsonPost({ ...answers, faixa_valor_max: amount }));
      await onSaved();
      onClose();
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível atualizar a triagem.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppointmentModal title="Triagem de Compatibilidade" onClose={() => { if (!saving) onClose(); }}>
      {questions.map(({ key, label, options }) => (
        <View key={key} style={{ gap: 6 }}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.options}>
            {options.map(option => (
              <Choice key={option} label={option} selected={answers[key] === option}
                onPress={() => setAnswers(current => ({ ...current, [key]: option }))} />
            ))}
          </View>
        </View>
      ))}
      <Text style={styles.label}>Valor máximo por sessão (R$)</Text>
      <FormInput accessibilityLabel="Valor máximo por sessão" value={budget}
        onChangeText={setBudget} keyboardType="decimal-pad" placeholder="Ex.: 160" />
      <Feedback>{feedback}</Feedback>
      <Action icon="clipboard-outline" label={saving ? 'Salvando…' : 'Salvar triagem'} onPress={save} disabled={saving} />
    </AppointmentModal>
  );
}
