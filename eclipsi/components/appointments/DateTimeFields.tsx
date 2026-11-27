import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View } from 'react-native';

import { Choice, styles } from './AppointmentUI';
import type { DateTimeFieldsProps } from './dateTime';

export function DateTimeFields({ date, time, onDate, onTime }: DateTimeFieldsProps) {
  const [mode, setMode] = useState<'date' | 'time'>();
  const initial = date ? new Date(`${date}T${time || '00:00'}:00`) : new Date();

  return (
    <View style={styles.options}>
      <Choice label={date || 'Selecionar data'} selected={mode === 'date'} onPress={() => setMode('date')} />
      <Choice label={time || 'Selecionar horário'} selected={mode === 'time'} onPress={() => setMode('time')} />
      {mode && (
        <DateTimePicker
          value={initial}
          mode={mode}
          minimumDate={mode === 'date' ? new Date() : undefined}
          onDismiss={() => setMode(undefined)}
          onValueChange={(_, value) => {
            const pad = (number: number) => String(number).padStart(2, '0');
            if (mode === 'date') {
              onDate(`${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`);
            } else {
              onTime(`${pad(value.getHours())}:${pad(value.getMinutes())}`);
            }
            setMode(undefined);
          }}
        />
      )}
    </View>
  );
}
