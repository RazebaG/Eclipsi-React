import { professionalRegistration } from '../../lib/professionalRegistration';
import { Head } from 'expo-router/head';
import { Action, AppointmentModal, Feedback, styles as appointmentStyles } from '../../components/appointments/AppointmentUI';
import { BookingModal } from '../../components/appointments/BookingModal';
import { PixModal } from '../../components/appointments/PixModal';
import { SpecialistCard } from '../../components/appointments/SpecialistCard';
import { TriageModal } from '../../components/appointments/TriageModal';
import { appointmentTime, currency, errorMessage, listSpecialists, type Specialist } from '../../lib/appointments';
import { withRouteGuard, useLogout } from '../../components/RouteGuard';
import { palette } from '../../lib/palette';
import React, { useCallback, useEffect, useState } from 'react';
import { api, ApiError, setProfileAvatar, subscribeProfileAvatar } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const avatar = require('../../assets/images/avatar.png');

type AppointmentRecord = {
  id: number | string;
  medico_id?: number | string;
  medico_nome?: string;
  especialidade?: string;
  registro?: string;
  uf?: string;
  abordagem?: string;
  modalidade?: string;
  data_hora: string;
  valor: number;
  status: string;
  anotacoes?: string;
  pagamento_status?: string;
  payment_status?: string;
};

function toAppointmentCard(item: AppointmentRecord) {
  const paymentStatus = item.pagamento_status || item.payment_status;
  return {
    id: item.id, doctorId: item.medico_id, doctor: item.medico_nome,
    specialty: item.especialidade, registration: item.registro, uf: item.uf,
    approach: item.abordagem, modality: item.modalidade,
    date: appointmentTime(item.data_hora), price: currency.format(item.valor),
    img: avatar, status: item.status, paid: paymentStatus === 'pago',
    paymentStatus, annotation: item.anotacoes,
  };
}

type AppointmentCard = ReturnType<typeof toAppointmentCard>;

const statusLabels: Record<string, string> = {
  agendada: 'Agendada', concluida: 'Concluída', realizada: 'Realizada', cancelada: 'Cancelada',
  pago: 'Pago', pendente: 'Pendente', cancelado: 'Cancelado', estornado: 'Estornado',
};

function UserScreen() {
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Specialist | null>(null);
  const [triageOpen, setTriageOpen] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState<number | string | null>(null);
  const [paidAppointments, setPaidAppointments] = useState<Set<string>>(() => new Set());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogFeedback, setCatalogFeedback] = useState('');
  const [appointmentFeedback, setAppointmentFeedback] = useState('');
  const [profileFeedback, setProfileFeedback] = useState('');
  // Estados para navegação entre abas ('home', 'consultas', 'perfil', 'configuracoes')
  const [activeTab, setActiveTab] = useState<'home' | 'consultas' | 'perfil' | 'configuracoes'>('home');

  // Estados dos Modais
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCard | null>(null);

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingDoctorName, setRatingDoctorName] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingAppointmentId, setRatingAppointmentId] = useState<number | null>(null);

  // Estados do Perfil e Configurações
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentCard[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentCard[]>([]);
  const [doctorsList, setDoctorsList] = useState<Specialist[]>([]);

  const reloadAppointments = useCallback(async () => {
    const result = await api<{ appointments: AppointmentRecord[] }>('/api/v1/appointments');
    const appointments = result.appointments.map(toAppointmentCard);
    setUpcomingAppointments(appointments.filter(item => item.status === 'agendada'));
    setCompletedAppointments(appointments.filter(item => ['concluida', 'realizada'].includes(item.status)));
  }, []);

  async function reloadSpecialists() {
    setCatalogLoading(true);
    setCatalogFeedback('');
    try {
      setDoctorsList(await listSpecialists());
    } catch (error) {
      setCatalogFeedback(errorMessage(error, 'Não foi possível carregar os especialistas.'));
      throw error;
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribeAvatar = subscribeProfileAvatar(setProfilePhoto);
    async function loadProfile() {
      try {
        const [{ profile }] = await Promise.all([
          api<{ profile: { nome?: string; descricao?: string; email?: string; telefone?: string; foto?: string } }>('/api/v1/profile/me'),
          reloadAppointments(),
        ]);
        setProfileName(profile?.nome || '');
        setProfileBio(profile?.descricao || '');
        setUserEmail(profile?.email || '');
        setUserPhone(profile?.telefone || '');
        setProfileAvatar(profile?.foto || null);
      } catch (error) {
        setAppointmentFeedback(errorMessage(error, 'Não foi possível carregar as consultas.'));
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
    return unsubscribeAvatar;
  }, [reloadAppointments]);

  useEffect(() => {
    let active = true;
    void listSpecialists().then(
      doctors => { if (active) setDoctorsList(doctors); },
      error => { if (active) setCatalogFeedback(errorMessage(error, 'Não foi possível carregar os especialistas.')); },
    ).finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  function reloadAfterAction() {
    void reloadAppointments().catch(error => {
      setAppointmentFeedback(errorMessage(error, 'Não foi possível atualizar as consultas.'));
    });
  }


  const chooseProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setProfileFeedback('Permissão para acessar a galeria foi negada.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePhoto(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      setProfileAvatar(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      setProfileFeedback('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header Superior Fixo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.burgerBtn} accessibilityLabel="Abrir menu" onPress={() => setDrawerOpen(true)}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.brandBadge}
              resizeMode="contain"
            />
            <Text style={styles.logo}>EcliPsi</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor={palette.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={profilePhoto ? { uri: profilePhoto } : avatar} style={styles.profileImg} />
        </View>
      </View>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.indigo} />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <>
        {activeTab === 'home' && (
          <View>
            <Text style={styles.pageTitle}>Página Inicial</Text>
            <Text style={styles.pageSubtitle}>Acompanhe suas consultas agendadas e seu histórico:</Text>

            <Feedback>{appointmentFeedback}</Feedback>

            {/* Próximas Consultas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons aria-hidden name="calendar-outline" size={16} color={palette.indigo} /> Próximas Consultas
              </Text>
              {upcomingAppointments.map((item) => (
                <View key={item.id} style={styles.appointmentCard}>
                  <Image source={item.img} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <TouchableOpacity onPress={() => setSelectedAppointment(item)}>
                      <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                      <Text style={styles.specialty}>{item.specialty}</Text>
                      <Text style={styles.cardDate}><Ionicons aria-hidden name="calendar-outline" size={16} color={palette.indigo} /> {item.date}</Text>
                      <Text style={styles.cardPrice}><Ionicons aria-hidden name="wallet-outline" size={16} color={palette.wine} /> {item.price}</Text>
                    </TouchableOpacity>
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>{item.status}</Text>
                    </View>
                    {item.annotation ? (
                      <Text style={styles.cardPreview}>Prescrição: {item.annotation}</Text>
                    ) : null}
                    <View style={styles.cardActions}>
                      <TouchableOpacity accessibilityRole="button" style={styles.viewBtn} accessibilityLabel="Ver detalhes"
                        onPress={() => setSelectedAppointment(item)}>
                        <Text style={styles.viewBtnText}><Ionicons aria-hidden name="document-text-outline" size={18} color={palette.cream} /> Ver detalhes</Text>
                      </TouchableOpacity>
                      {item.paid || paidAppointments.has(String(item.id)) ? (
                        <Text style={appointmentStyles.status}>Pago</Text>
                      ) : (
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel="Pagar via PIX"
                          style={appointmentStyles.button}
                          onPress={event => {
                            event.stopPropagation();
                            setPaymentAppointment(item.id);
                          }}
                        >
                          <Text style={appointmentStyles.buttonText}><Ionicons aria-hidden name="qr-code-outline" size={18} color={palette.cream} /> Pagar via PIX</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={async (event) => {
                          event.stopPropagation();
                          try {
                            await api(`/api/v1/appointments/${item.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'cancelada' }),
                            });
                            await reloadAppointments();
                            Alert.alert('Consulta cancelada', 'A consulta foi cancelada.');
                          } catch (error) {
                            Alert.alert('Erro', error instanceof ApiError ? error.message : 'Não foi possível cancelar.');
                          }
                        }}
                      >
                        <Text style={styles.rateBtnText}>Cancelar Consulta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            {/* Consultas Realizadas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons aria-hidden name="time-outline" size={16} color={palette.indigo} /> Consultas Realizadas
              </Text>
              {completedAppointments.map((item) => (
                <View key={item.id} style={styles.appointmentCard}>
                  <Image source={item.img} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <TouchableOpacity onPress={() => setSelectedAppointment(item)}>
                      <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                      <Text style={styles.specialty}>{item.specialty}</Text>
                      <Text style={styles.cardDate}><Ionicons aria-hidden name="calendar-outline" size={16} color={palette.indigo} /> {item.date}</Text>
                      <Text style={styles.cardPrice}><Ionicons aria-hidden name="wallet-outline" size={16} color={palette.wine} /> {item.price}</Text>
                    </TouchableOpacity>
                    {item.annotation ? (
                      <Text style={styles.cardPreview} numberOfLines={3}>Prescrição: {item.annotation}</Text>
                    ) : null}
                    <View style={styles.cardActions}>
                      <TouchableOpacity accessibilityRole="button" style={styles.viewBtn} accessibilityLabel="Ver detalhes"
                        onPress={() => setSelectedAppointment(item)}>
                        <Text style={styles.viewBtnText}><Ionicons aria-hidden name="document-text-outline" size={18} color={palette.cream} /> Ver detalhes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setRatingDoctorName(item.doctor || 'Profissional');
                          setRatingAppointmentId(Number(item.id));
                          setRatingModalVisible(true);
                        }}
                      >
                        <Text style={styles.rateBtnText}><Ionicons aria-hidden name="star-outline" size={16} color={palette.cream} /> Avaliar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'consultas' && (
          <View>
            <Text style={styles.pageTitle}>Buscar Consultas</Text>
            <Text style={styles.pageSubtitle}>Encontre o profissional ideal para o seu acompanhamento:</Text>
            <View style={appointmentStyles.card}>
              <Action icon="clipboard-outline" label="Triagem de Compatibilidade" onPress={() => setTriageOpen(true)} />
            </View>
            {catalogLoading && <ActivityIndicator color={palette.indigo} accessibilityLabel="Carregando especialistas" />}
            <Feedback>{catalogFeedback}</Feedback>
            {!catalogLoading && !catalogFeedback && !doctorsList.length && (
              <Text style={appointmentStyles.copy}>Nenhum especialista encontrado.</Text>
            )}
            {doctorsList
              .filter(doc => {
                const query = searchQuery.trim().toLowerCase();
                return [doc.nome, doc.especialidade, doc.abordagem, doc.descricao]
                  .join(' ').toLowerCase().includes(query);
              })
              .map(doc => <SpecialistCard key={doc.id} doctor={doc} onBook={() => setSelectedDoctor(doc)} />)}
          </View>
        )}

        {activeTab === 'perfil' && (
          <View>
            <View style={styles.profileHeaderContainer}>
              <Text style={styles.pageTitle}>Meu Perfil</Text>
              <TouchableOpacity
                style={styles.settingsNavBtn}
                onPress={() => setActiveTab('configuracoes')}
              >
                <Ionicons aria-hidden name="settings-outline" size={14} color={palette.indigo} />
                <Text style={styles.settingsNavBtnText}>Configurações</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsGroup}>
              <View style={styles.profileAvatarWrapper}>
                <Image source={profilePhoto ? { uri: profilePhoto } : avatar} style={styles.profileAvatarLg} />
                <TouchableOpacity style={styles.avatarUploadBtn} onPress={chooseProfilePhoto}>
                  <Text style={styles.avatarUploadBtnText}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={profileName}
                  onChangeText={setProfileName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição de si mesmo (Bio)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={profileBio}
                  onChangeText={setProfileBio}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {profileFeedback ? (
                <Text accessibilityRole="alert" style={styles.profileFeedback}>{profileFeedback}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.saveSettingsBtn}
                onPress={async () => {
                  try {
                    await api('/api/v1/profile/me', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        nome: profileName,
                        descricao: profileBio,
                        ...(profilePhoto ? { foto: profilePhoto } : {}),
                      }),
                    });
                    setProfileFeedback('Perfil salvo com sucesso.');
                    Alert.alert('Perfil salvo com sucesso!');
                  } catch (error) {
                    setProfileFeedback(error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                  }
                }}
              >
                <Text style={styles.saveSettingsBtnText}>Salvar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'configuracoes' && (
          <View>
            <View style={styles.settingsHeaderContainer}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setActiveTab('perfil')}>
                <Ionicons aria-hidden name="arrow-back-outline" size={16} color={palette.indigo} />
                <Text style={styles.btnBackText}>Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Configurações</Text>
            </View>

            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>Informações de Acesso</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={styles.input} value={userEmail} onChangeText={setUserEmail} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} value={userPhone} onChangeText={setUserPhone} />
              </View>

              <TouchableOpacity
                style={styles.saveSettingsBtn}
                onPress={async () => {
                  try {
                    await api('/api/v1/profile/me', {
                      method: 'PATCH',
                      body: JSON.stringify({ telefone: userPhone }),
                    });
                    Alert.alert('Configurações salvas!');
                  } catch (error) {
                    Alert.alert('Erro', error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                  }
                }}
              >
                <Text style={styles.saveSettingsBtnText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>

      {selectedDoctor && (
        <BookingModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBooked={() => {
          setSelectedDoctor(null);
          setActiveTab('home');
          setAppointmentFeedback('Consulta agendada com sucesso!');
          reloadAfterAction();
        }} />
      )}
      {triageOpen && <TriageModal onClose={() => setTriageOpen(false)} onSaved={reloadSpecialists} />}
      {paymentAppointment !== null && (
        <PixModal appointmentId={paymentAppointment} onClose={() => setPaymentAppointment(null)} onPaid={() => {
          setPaidAppointments(current => new Set(current).add(String(paymentAppointment)));
          setPaymentAppointment(null);
          setAppointmentFeedback('Pagamento confirmado.');
          reloadAfterAction();
        }} />
      )}

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerBackdrop}>
          <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>EcliPsi</Text>
            {[
              { label: 'Início', tab: 'home' as const },
              { label: 'Minhas Consultas', tab: 'consultas' as const },
              { label: 'Perfil', tab: 'perfil' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.tab}
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab(item.tab);
                  setDrawerOpen(false);
                }}
              >
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.drawerItem, styles.drawerLogout]}
              accessibilityRole="button" accessibilityLabel="Sair"
              onPress={logout}
            >
              <Text style={styles.drawerItemText}><Ionicons aria-hidden name="log-out-outline" size={17} color={palette.wine} /> Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Navegação Inferior (Bottom Navigation) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Início"
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons aria-hidden name="home-outline" size={20} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Buscar consultas"
          style={[styles.navItem, activeTab === 'consultas' && styles.navItemActive]}
          onPress={() => setActiveTab('consultas')}
        >
          <Ionicons aria-hidden name="search-outline" size={20} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Perfil"
          style={[styles.navItem, activeTab === 'perfil' && styles.navItemActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <Ionicons aria-hidden name="person-circle-outline" size={20} color={palette.cream} />
        </TouchableOpacity>
      </View>

      {selectedAppointment && (
        <ConsultationDetails
          appointment={selectedAppointment}
          specialist={doctorsList.find(doctor => String(doctor.id) === String(selectedAppointment.doctorId))}
          paid={selectedAppointment.paid || paidAppointments.has(String(selectedAppointment.id))}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Modal de Avaliação */}
      <Modal visible={ratingModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Avaliar Atendimento</Text>
            <Text style={styles.specialty}>{ratingDoctorName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} accessibilityRole="button" accessibilityLabel={`Nota ${value} de 5`}
                  accessibilityState={{ selected: ratingValue === value }} onPress={() => setRatingValue(value)}>
                  <Ionicons aria-hidden name={value <= ratingValue ? 'star' : 'star-outline'} size={24} color={palette.wine} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Comentário (opcional):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Como foi sua experiência?"
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
              />
            </View>
            <TouchableOpacity
              style={styles.saveSettingsBtn}
              onPress={async () => {
                if (!ratingAppointmentId || ratingValue < 1) {
                  Alert.alert('Atenção', 'Selecione uma nota de 1 a 5.');
                  return;
                }
                try {
                  await api('/api/v1/reviews', {
                    method: 'POST',
                    body: JSON.stringify({
                      appointment_id: ratingAppointmentId,
                      nota: ratingValue,
                      comentario: ratingComment,
                    }),
                  });
                  Alert.alert('Avaliação enviada com sucesso!');
                  setRatingModalVisible(false);
                } catch (error) {
                  Alert.alert('Erro', error instanceof ApiError ? error.message : 'Nao foi possivel avaliar.');
                }
              }}
            >
              <Text style={styles.saveSettingsBtnText}>Enviar Avaliação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Estilização adaptada para StyleSheet do React Native
function ConsultationDetails({ appointment, specialist, paid, onClose }: {
  appointment: AppointmentCard; specialist?: Specialist; paid: boolean; onClose: () => void;
}) {
  const specialty = appointment.specialty || specialist?.especialidade;
  const registration = professionalRegistration(
    appointment.registration || specialist?.registro, appointment.uf || specialist?.uf, specialty,
  );
  const fields = [
    ['Profissional', appointment.doctor || specialist?.nome],
    ['Especialidade', specialty],
    ['Registro profissional', registration],
    ['Abordagem', appointment.approach || specialist?.abordagem],
    ['Modalidade', appointment.modality || specialist?.modalidade],
    ['Data e hora', appointment.date],
    ['Valor', appointment.price],
    ['Status da consulta', statusLabels[appointment.status] || appointment.status],
    ['Status do pagamento', paid ? 'Pago' : statusLabels[appointment.paymentStatus ?? ''] || appointment.paymentStatus],
    ...(appointment.annotation ? [['Anotações do profissional', appointment.annotation]] : []),
  ];

  return (
    <AppointmentModal title="Detalhes da consulta" onClose={onClose}>
      {fields.map(([label, value]) => (
        <View key={label}>
          <Text style={appointmentStyles.label}>{label}</Text>
          <Text style={appointmentStyles.copy}>{value || 'Não informado'}</Text>
        </View>
      ))}
    </AppointmentModal>
  );
}

const GuardedScreen = withRouteGuard(UserScreen, 'paciente');

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Painel do Paciente</title>
      </Head>
      <GuardedScreen />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  header: {
    backgroundColor: palette.indigo,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  burgerBtn: {
    gap: 4,
    padding: 4,
  },
  burgerLine: {
    width: 24,
    height: 3,
    backgroundColor: palette.cream,
    borderRadius: 2,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandBadge: {
    width: 38,
    height: 38,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.white,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchInput: {
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 14,
    color: palette.muted,
    width: 120,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: palette.muted,
    marginBottom: 16,
  },
  homeSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: palette.salmon,
    marginVertical: 24,
  },
  appointmentCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImg: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  specialty: {
    fontSize: 13,
    color: palette.muted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: palette.wine,
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    color: palette.wine,
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 8,
  },
  cardRating: {
    fontSize: 13,
    color: palette.wine,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingBadge: {
    backgroundColor: palette.salmon,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  upcomingBadgeText: {
    color: palette.indigo,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewBtnText: {
    color: palette.white,
    fontSize: 19,
    fontWeight: 'bold',
  },
  rateBtn: {
    backgroundColor: palette.wine,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rateBtnText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: palette.indigo,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
  },
  navItem: {
    padding: 10,
    opacity: 0.6,
  },
  navItemActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
    backgroundColor: palette.wine,
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 24,
    color: palette.muted,
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsNavBtn: {
    borderWidth: 1,
    borderColor: palette.indigo,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsNavBtnText: {
    color: palette.indigo,
    fontWeight: 'bold',
    fontSize: 12,
  },
  settingsGroup: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatarWrapper: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  profileAvatarLg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: palette.indigo,
  },
  avatarUploadBtn: {
    backgroundColor: palette.cream,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avatarUploadBtnText: {
    color: palette.indigo,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: palette.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: palette.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveSettingsBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveSettingsBtnText: {
    color: palette.white,
    fontWeight: 'bold',
    fontSize: 19,
  },
  settingsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnBackText: {
    color: palette.indigo,
    fontWeight: 'bold',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
    borderBottomWidth: 2,
    borderBottomColor: palette.cream,
    paddingBottom: 4,
  },
  loadingContainer: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: palette.muted,
    fontSize: 14,
  },
  profileFeedback: {
    width: '100%',
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: palette.cream,
    color: palette.indigo,
    textAlign: 'center',
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawer: {
    width: 280,
    maxWidth: '80%',
    backgroundColor: palette.white,
    paddingTop: 32,
    paddingHorizontal: 16,
    shadowColor: palette.indigo,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerTitle: {
    color: palette.indigo,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 24,
  },
  drawerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  drawerItemText: {
    color: palette.indigo,
    fontSize: 16,
    fontWeight: '700',
  },
  drawerLogout: {
    marginTop: 16,
    borderBottomWidth: 0,
  },
});