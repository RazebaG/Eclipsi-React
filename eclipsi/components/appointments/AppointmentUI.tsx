import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PrimaryButton } from '../PrimaryButton';
import { palette } from '../../lib/palette';

export function Action({ label, onPress, disabled, icon }: {
  label: string; onPress: () => void; disabled?: boolean; icon?: ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <PrimaryButton accessibilityLabel={label} onPress={onPress} disabled={disabled} style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>
        {icon && <><Ionicons aria-hidden name={icon} size={18} color={palette.cream} />{' '}</>}
        {label}
      </Text>
    </PrimaryButton>
  );
}

export function Choice({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.choice, selected && styles.selected]}
      onPress={onPress}
    >
      <Text style={[styles.choiceText, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Feedback({ children }: { children: ReactNode }) {
  return children ? <Text accessibilityRole="alert" style={styles.feedback}>{children}</Text> : null;
}

export function AppointmentModal({ title, subtitle, children, onClose }: {
  title: string; subtitle?: string; children: ReactNode; onClose: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose}>
              <Text style={styles.close}>Fechar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16,
    backgroundColor: 'rgba(46, 35, 130, 0.55)',
  },
  dialog: {
    width: '100%', maxWidth: 500, maxHeight: '88%', borderRadius: 20,
    overflow: 'hidden', backgroundColor: palette.white,
  },
  header: {
    backgroundColor: palette.indigo, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
  },
  heading: { flex: 1 },
  title: { color: palette.white, fontWeight: 'bold', fontSize: 21 },
  subtitle: { color: palette.cream, fontWeight: 'bold', fontSize: 18 },
  close: { color: palette.cream, fontWeight: 'bold', paddingVertical: 10 },
  body: { padding: 16, gap: 12 },
  button: {
    alignItems: 'center', justifyContent: 'center', padding: 11, backgroundColor: palette.magenta,
    borderBottomColor: palette.wine, borderBottomWidth: 3, borderRadius: 13,
  },
  buttonText: { color: palette.white, fontSize: 19, fontWeight: 'bold', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  choice: {
    backgroundColor: palette.cream, paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 9, borderWidth: 1, borderColor: palette.border,
  },
  selected: { backgroundColor: palette.wine, borderColor: palette.wine },
  choiceText: { color: palette.indigo, fontWeight: '600' },
  selectedText: { color: palette.white },
  feedback: { color: palette.indigo, backgroundColor: palette.salmon, padding: 10, borderRadius: 8 },
  copy: { color: palette.indigo },
  label: { color: palette.indigo, fontWeight: 'bold' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { padding: 16, gap: 12, borderRadius: 16, backgroundColor: palette.white, marginBottom: 14 },
  sectionTitle: { color: palette.indigo, fontSize: 22, fontWeight: 'bold' },
  code: { color: palette.indigo, backgroundColor: palette.cream, padding: 10, borderRadius: 8 },
  qr: { width: 216, height: 216, alignSelf: 'center' },
  qrContainer: { alignSelf: 'center', backgroundColor: palette.white, padding: 10 },
  status: {
    alignSelf: 'flex-start', color: palette.indigo, backgroundColor: palette.salmon,
    fontWeight: 'bold', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  reason: {
    color: palette.indigo, backgroundColor: palette.cream,
    borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4,
  },
});
