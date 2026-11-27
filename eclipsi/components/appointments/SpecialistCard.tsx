import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { currency, type Specialist } from '../../lib/appointments';
import { professionalRegistration } from '../../lib/professionalRegistration';
import { palette } from '../../lib/palette';
import { Action, styles } from './AppointmentUI';

const avatar = require('../../assets/images/avatar.png');

export function SpecialistCard({ doctor, onBook }: { doctor: Specialist; onBook: () => void }) {
  const [failedPhoto, setFailedPhoto] = useState<string>();
  const registration = professionalRegistration(doctor.registro, doctor.uf, doctor.especialidade);

  return (
    <View style={styles.card}>
      <View style={local.summary}>
        <Image
          source={doctor.foto && failedPhoto !== doctor.foto ? { uri: doctor.foto } : avatar}
          style={local.photo}
          onError={() => setFailedPhoto(doctor.foto)}
          accessibilityLabel={`Foto de ${doctor.nome}`}
        />
        <View style={local.identity}>
          <Text style={styles.label}>{doctor.nome}</Text>
          <Text style={styles.copy}>{doctor.especialidade || 'Profissional de saúde mental'}</Text>
          {registration && <Text style={styles.label}>{registration}</Text>}
          <Text style={styles.copy}>
            {[doctor.abordagem, doctor.modalidade].filter(Boolean).join(' · ') || 'Abordagem e modalidade não informadas'}
          </Text>
          <Text style={styles.label}>
            {doctor.valor_hora == null ? 'Valor não informado' : `${currency.format(doctor.valor_hora)} por sessão`}
          </Text>
        </View>
      </View>
      {(doctor.compatibility_score ?? 0) > 0 && (
        <>
          <Text style={styles.status}>{doctor.compatibility_score}% compatível</Text>
          <View style={styles.options}>
            {doctor.match_reasons?.map(reason => <Text style={styles.reason} key={reason}>{reason}</Text>)}
          </View>
        </>
      )}
      <Action icon="calendar-outline" label="Ver horários" onPress={onBook} />
    </View>
  );
}

const local = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 68, height: 68, borderRadius: 16, backgroundColor: palette.cream },
  identity: { flex: 1, gap: 4 },
});
