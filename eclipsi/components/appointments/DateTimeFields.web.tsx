import type { CSSProperties } from 'react';

import { palette } from '../../lib/palette';
import type { DateTimeFieldsProps } from './dateTime';

const label: CSSProperties = { color: palette.indigo, fontWeight: 700, display: 'grid', gap: 5, flex: '1 1 135px' };
const input: CSSProperties = {
  color: palette.indigo, backgroundColor: palette.white, border: `1px solid ${palette.border}`,
  borderRadius: 10, minHeight: 44, padding: '0 10px', font: 'inherit', outlineColor: palette.indigo,
};

export function DateTimeFields({ date, time, onDate, onTime }: DateTimeFieldsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <label style={label}>Data<input style={input} type="date" value={date}
        onChange={event => onDate(event.currentTarget.value)} /></label>
      <label style={label}>Horário<input style={input} type="time" value={time}
        onChange={event => onTime(event.currentTarget.value)} /></label>
    </div>
  );
}
