import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../lib/palette';

export function AcademicDemoNotice({ payment = false }: { payment?: boolean }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.title}>Ambiente de Demonstração Acadêmica</Text>
      <Text style={styles.description}>
        {payment
          ? 'MVP — Projeto Integrador. Este pagamento é simulado para avaliação e não gera cobrança.'
          : 'MVP — Projeto Integrador. Perfis de exemplo e pagamentos em modo sandbox são simulados para avaliação.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.cream,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  title: { color: palette.indigo, fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  description: { color: palette.indigo, fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
