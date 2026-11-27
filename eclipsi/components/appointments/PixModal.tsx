import { AcademicDemoNotice } from '../AcademicDemoNotice';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { ActivityIndicator, Image, Platform, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { api } from '../../lib/api';
import { createPix, currency, errorMessage, type PixPayment } from '../../lib/appointments';
import { palette } from '../../lib/palette';
import { Action, AppointmentModal, Feedback, styles } from './AppointmentUI';

export function PixModal({ appointmentId, onClose, onPaid }: {
  appointmentId: number | string; onClose: () => void; onPaid: () => void;
}) {
  const [payment, setPayment] = useState<PixPayment>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    void createPix(appointmentId).then(
      result => { if (active) setPayment(result); },
      error => { if (active) setFeedback(errorMessage(error, 'Não foi possível carregar o pagamento.')); },
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [appointmentId]);

  useEffect(() => {
    if (payment?.status === 'pago') onPaid();
  }, [payment?.status, onPaid]);

  async function copy() {
    if (!payment) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payment.qr_code);
      } else if (!(await Clipboard.setStringAsync(payment.qr_code))) {
        throw new Error('Clipboard indisponível');
      }
      setFeedback('Código PIX copiado!');
    } catch {
      setFeedback('Não foi possível copiar. Selecione o código para copiar manualmente.');
    }
  }

  async function confirmDemo() {
    if (!payment || payment.mode !== 'sandbox_mock' || busy) return;
    setBusy(true);
    setFeedback('');
    try {
      const result = await api<{ status: string }>(
        `/api/v1/payments/pix/${encodeURIComponent(payment.payment_id)}/confirm`, { method: 'POST' },
      );
      if (result.status !== 'pago') throw new Error('Pagamento não confirmado');
      onPaid();
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível confirmar o pagamento.'));
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    setFeedback('');
    try {
      const result = await createPix(appointmentId);
      setPayment(result);
      if (result.status !== 'pago') setFeedback('Aguardando confirmação do pagamento.');
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível verificar o pagamento.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppointmentModal title="Pagamento via PIX" subtitle={payment && currency.format(payment.valor)}
      onClose={() => { if (!busy) onClose(); }}>
      {loading && <ActivityIndicator color={palette.indigo} accessibilityLabel="Carregando pagamento" />}
      {payment && payment.status !== 'pago' && (
        <>
          {payment.mode === 'sandbox_mock' && (
            <AcademicDemoNotice payment />
          )}
          {payment.qr_code_base64 ? (
            <Image source={{ uri: `data:image/png;base64,${payment.qr_code_base64}` }}
              style={styles.qr} resizeMode="contain" accessibilityLabel="QR Code PIX" />
          ) : payment.mode === 'sandbox_mock' && payment.qr_code ? (
            <View style={styles.qrContainer} accessible accessibilityLabel="QR Code PIX de demonstração">
              <QRCode value={payment.qr_code} size={186} quietZone={8} color={palette.indigo}
                backgroundColor={palette.white} />
            </View>
          ) : null}
          <Text style={styles.label}>PIX Copia e Cola</Text>
          <Text selectable style={styles.code}>{payment.qr_code}</Text>
          <Action icon="copy-outline" label="Copiar Código PIX" onPress={copy} disabled={busy} />
          {payment.mode === 'sandbox_mock' ? (
            <Action icon="checkmark-circle-outline" label="Confirmar Pagamento (Demonstração)" onPress={confirmDemo} disabled={busy} />
          ) : (
            <Action icon="refresh-outline" label="Verificar pagamento" onPress={refresh} disabled={busy} />
          )}
        </>
      )}
      <Feedback>{feedback}</Feedback>
    </AppointmentModal>
  );
}
