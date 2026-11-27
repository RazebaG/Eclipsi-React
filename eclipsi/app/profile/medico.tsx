import { Head } from 'expo-router/head';
import { AvailabilityPanel } from '../../components/appointments/AvailabilityPanel';
import { withRouteGuard, useLogout } from '../../components/RouteGuard';
import { palette } from '../../lib/palette';
import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const avatar = require('../../assets/images/avatar.png');

function MedicoScreen() {
  const logout = useLogout();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState('');
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [concludeLoading, setConcludeLoading] = useState(false);
  const [prescriptionFeedback, setPrescriptionFeedback] = useState('');
  // Estados de navegação e modais
  const [activeTab, setActiveTab] = useState<'home' | 'pacientes' | 'perfil' | 'configuracoes' | 'disponibilidade'>('home');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Estados de formulários / inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  // Perfil Profissional (Mock state)
  const [professionalId, setProfessionalId] = useState<number | string>();
  const [profileName, setProfileName] = useState('');
  const [councilNumber, setCouncilNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Dados estáticos mapeados
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, dashboard, appointmentData] = await Promise.all([
          api<{ success: boolean; profile: any }>('/api/v1/profile/me'),
          api<{ success: boolean; stats: any }>('/api/v1/doctor/dashboard'),
          api<{ success: boolean; appointments: any[] }>('/api/v1/doctor/appointments'),
        ]);
        setProfessionalId(profile.profile?.id);
        setProfileName(profile.profile?.nome || '');
        setCouncilNumber(profile.profile?.registro || '');
        setHourlyRate(String(profile.profile?.valor_hora ?? ''));
        setProfileBio(profile.profile?.descricao || '');
        setProfileEmail(profile.profile?.email || '');
        setProfilePhone(profile.profile?.telefone || '');
        setProfilePhoto(profile.profile?.foto || null);
        setDashboardStats(dashboard.stats || null);
        setAppointments(appointmentData.appointments.map((item) => ({
          id: item.id,
          patient: item.paciente_nome,
          type: 'Consulta',
          date: new Date(item.data_hora).toLocaleString('pt-BR'),
          price: `R$ ${Number(item.valor).toFixed(2)}`,
          img: avatar,
          history: item.anotacoes || 'Sem histórico registrado.',
          preview: item.anotacoes || 'Consulta agendada.',
          status: item.status,
        })));
      } catch (error) {
        if (error instanceof ApiError) Alert.alert('Erro', error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reloadAppointments = async () => {
    const result = await api<{ success: boolean; appointments: any[] }>('/api/v1/doctor/appointments');
    setAppointments(result.appointments.map((item) => ({
      id: item.id,
      patient: item.paciente_nome,
      type: 'Consulta',
      date: new Date(item.data_hora).toLocaleString('pt-BR'),
      price: `R$ ${Number(item.valor).toFixed(2)}`,
      img: avatar,
      history: item.anotacoes || 'Sem histórico registrado.',
      preview: item.anotacoes || 'Consulta agendada.',
      status: item.status,
    })));
  };

  const patientsList: any[] = [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar  barStyle="light-content" />

      {/* Header Fixo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} accessibilityLabel="Abrir menu">
            <Ionicons aria-hidden name="menu" size={26} color={palette.white} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
            <Text style={styles.logo}>EcliPsi | Profissional</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar pacientes..."
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
        
        {/* ABA: MINHA AGENDA */}
        {activeTab === 'home' && (
          <View>
            <Text style={styles.pageTitle}>Próximas Consultas</Text>
            <Text style={styles.pageSubtitle}>Acompanhamento dos atendimentos agendados:</Text>

            <View style={styles.cardsGrid}>
              {appointments.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.appointmentCard}
                  onPress={() => setSelectedAppointment(item)}
                >
                  <Image source={item.img} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.patient}</Text>
                    <Text style={styles.specialty}>{item.type}</Text>
                    <Text style={styles.cardDate}><Ionicons aria-hidden name="calendar-outline" size={16} color={palette.indigo} /> {item.date}</Text>
                    <Text style={styles.cardPrice}><Ionicons aria-hidden name="wallet-outline" size={16} color={palette.wine} /> {item.price}</Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
                    <View style={styles.viewBtn}>
                      <Text style={styles.btnText}><Ionicons aria-hidden name="document-text-outline" size={17} color={palette.cream} /> Ver prontuário / Laudo</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ABA: PACIENTES */}
        {activeTab === 'pacientes' && (
          <View>
            <Text style={styles.pageTitle}>Meus Pacientes</Text>
            <Text style={styles.pageSubtitle}>Gestão e histórico de prontuários dos seus pacientes vinculados:</Text>

            <View style={styles.cardsGrid}>
              {patientsList.map((patient) => (
                <TouchableOpacity 
                  key={patient.id} 
                  style={styles.doctorCard}
                  onPress={() => setSelectedPatient(patient)}
                >
                  <Image source={{ uri: patient.img }} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{patient.name}</Text>
                    <Text style={styles.specialty}>{patient.profession}</Text>
                    <Text style={styles.cardRating}>✔ {patient.rating}</Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>{patient.bio}</Text>
                    <View style={styles.viewDoctorBtn}>
                      <Text style={styles.btnText}>Acessar Ficha Completa</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ABA: PERFIL PROFISSIONAL */}
        {activeTab === 'disponibilidade' && (
          professionalId != null
            ? <AvailabilityPanel professionalId={professionalId} />
            : <Text style={styles.pageTitle}>Perfil profissional indisponível.</Text>
        )}

        {activeTab === 'perfil' && (
          <View>
            <View style={styles.profileHeaderContainer}>
              <Text style={styles.pageTitle}>Perfil Profissional</Text>
              <TouchableOpacity 
                style={styles.settingsNavBtn} 
                onPress={() => setActiveTab('configuracoes')}
              >
                <Text style={styles.settingsNavBtnText}><Ionicons aria-hidden name="settings-outline" size={16} color={palette.indigo} /> Configurações</Text>
              </TouchableOpacity>
            </View>

            {/* Resumo de Ganhos */}
            <View style={styles.earningsContainer}>
              <Text style={styles.earningsTitle}><Ionicons aria-hidden name="stats-chart-outline" size={16} color={palette.indigo} /> Resumo de Ganhos</Text>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Ganhos Realizados</Text>
                  <Text style={styles.earningsValue}>R$ {dashboardStats ? Number(dashboardStats.faturamento || 0).toFixed(2) : '0.00'}</Text>
                  <Text style={styles.earningsSubtext}>{dashboardStats?.consultas_pagantes || 0} consultas pagantes</Text>
                </View>
                <View style={[styles.earningsCard, styles.earningsCardHighlight]}>
                  <Text style={[styles.earningsLabel, styles.earningsLabelHighlight]}>Próximas / Realizadas</Text>
                  <Text style={[styles.earningsValue, styles.earningsValueHighlight]}>{dashboardStats?.agendadas || 0} / {dashboardStats?.realizadas || 0}</Text>
                  <Text style={[styles.earningsSubtext, styles.earningsSubtextHighlight]}>Consultas reais</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ABA: CONFIGURAÇÕES */}
        {activeTab === 'configuracoes' && (
          <View>
            <View style={styles.settingsHeaderContainer}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setActiveTab('perfil')}>
                <Text style={styles.btnBackText}>← Voltar ao Perfil</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Configurações</Text>
            </View>

            <View style={styles.settingsForm}>
              <View style={styles.settingsGroup}>
                <View style={styles.profileAvatarWrapper}>
                  <Image source={profilePhoto ? { uri: profilePhoto } : avatar} style={styles.profileAvatarLg} />
                  <TouchableOpacity
                    style={styles.saveSettingsBtn}
                    onPress={async () => {
                      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (!permission.granted) {
                        setProfileFeedback('Permissão para acessar fotos foi negada.');
                        return;
                      }
                      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
                      if (!result.canceled && result.assets[0]) {
                        const asset = result.assets[0];
                        setProfilePhoto(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
                      }
                    }}
                  >
                    <Text style={styles.btnText}>Alterar Foto</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>E-mail Profissional</Text>
                  <TextInput style={styles.input} value={profileEmail} onChangeText={setProfileEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefone / WhatsApp</Text>
                  <TextInput
                    style={styles.input}
                    value={profilePhone}
                    onChangeText={(value) => setProfilePhone(value.replace(/\D/g, '').slice(0, 11))}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Registro CRP/CRM</Text>
                  <TextInput style={styles.input} value={councilNumber} onChangeText={setCouncilNumber} maxLength={15} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Valor da Consulta (R$)</Text>
                  <TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="decimal-pad" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Abordagem / Descrição</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={profileBio} onChangeText={setProfileBio} multiline numberOfLines={4} />
                </View>
                {profileFeedback ? <Text accessibilityRole="alert" style={styles.profileFeedback}>{profileFeedback}</Text> : null}
                <TouchableOpacity
                  style={styles.saveSettingsBtn}
                  onPress={async () => {
                    try {
                      await api('/api/v1/profile/me', {
                        method: 'PATCH',
                        body: JSON.stringify({
                          nome: profileName,
                          email: profileEmail,
                          telefone: profilePhone,
                          registro: councilNumber,
                          valor_hora: Number(hourlyRate.replace(',', '.')),
                          descricao: profileBio,
                          ...(profilePhoto ? { foto: profilePhoto } : {}),
                        }),
                      });
                      setProfileFeedback('Perfil atualizado com sucesso!');
                    } catch (error) {
                      setProfileFeedback(error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                    }
                  }}
                >
                  <Text style={styles.btnText}>Salvar Configurações</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuBackdrop}>
          <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuPanel}>
            {[
              { label: 'Resumo', tab: 'home' as const },
              { label: 'Pacientes', tab: 'pacientes' as const },
              { label: 'Minha Disponibilidade', tab: 'disponibilidade' as const },
              { label: 'Perfil', tab: 'perfil' as const },
              { label: 'Configurações', tab: 'configuracoes' as const },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => { setActiveTab(item.tab); setMenuOpen(false); }}>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair" style={styles.menuItem} onPress={logout}>
              <Text style={styles.menuItemText}><Ionicons aria-hidden name="log-out-outline" size={17} color={palette.wine} /> Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes da Consulta / Prontuário */}
      <Modal visible={!!selectedAppointment} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedAppointment(null)}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            {selectedAppointment && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedAppointment.img }} style={styles.modalImg} />
                  <View>
                    <Text style={styles.modalPatientName}>{selectedAppointment.patient}</Text>
                    <Text style={styles.specialty}>{selectedAppointment.type}</Text>
                  </View>
                </View>

                <Text>Horário: {selectedAppointment.date}</Text>
                <Text>Valor: {selectedAppointment.price}</Text>
                
                <Text style={styles.modalSubHeader}>Histórico do Paciente:</Text>
                <View style={styles.feedbackTextContainer}>
                  <Text style={styles.feedbackText}>{selectedAppointment.history}</Text>
                </View>

                <Text style={styles.modalSubHeader}>Adicionar Anotações / Prescrição:</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { marginTop: 8 }]}
                  multiline
                  numberOfLines={4}
                  placeholder="Digite o parecer técnico..."
                  value={doctorNotes}
                  onChangeText={setDoctorNotes}
                />
                {prescriptionFeedback ? (
                  <Text accessibilityRole="alert" style={styles.profileFeedback}>{prescriptionFeedback}</Text>
                ) : null}

                <TouchableOpacity 
                  style={[styles.saveSettingsBtn, { marginTop: 12 }]} 
                  disabled={prescriptionLoading}
                  onPress={async () => {
                    setPrescriptionLoading(true);
                    setPrescriptionFeedback('');
                    try {
                      await api(`/api/v1/appointments/${selectedAppointment.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ anotacoes: doctorNotes }),
                      });
                      await reloadAppointments();
                      setPrescriptionFeedback('Prescrição salva com sucesso!');
                      setSelectedAppointment(null);
                    } catch (error) {
                      setPrescriptionFeedback(error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                    } finally {
                      setPrescriptionLoading(false);
                    }
                  }}
                >
                  {prescriptionLoading ? (
                    <><ActivityIndicator size="small" color={palette.white} /><Text style={styles.btnText}>Salvando...</Text></>
                  ) : (
                    <Text style={styles.btnText}><Ionicons aria-hidden name="document-text-outline" size={17} color={palette.cream} /> Salvar no Prontuário</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveSettingsBtn, { marginTop: 8 }]}
                  disabled={concludeLoading}
                  onPress={async () => {
                    setConcludeLoading(true);
                    setPrescriptionFeedback('');
                    try {
                      await api(`/api/v1/appointments/${selectedAppointment.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: 'concluida', anotacoes: doctorNotes }),
                      });
                      await reloadAppointments();
                      setPrescriptionFeedback('Consulta concluída e prescrição enviada!');
                      setSelectedAppointment(null);
                    } catch (error) {
                      setPrescriptionFeedback(error instanceof ApiError ? error.message : 'Nao foi possivel concluir.');
                    } finally {
                      setConcludeLoading(false);
                    }
                  }}
                >
                  {concludeLoading ? (
                    <><ActivityIndicator size="small" color={palette.white} /><Text style={styles.btnText}>Concluindo...</Text></>
                  ) : (
                    <Text style={styles.btnText}>Concluir Consulta</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Ficha Completa do Paciente */}
      <Modal visible={!!selectedPatient} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPatient(null)}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            {selectedPatient && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedPatient.img }} style={styles.modalImg} />
                  <View>
                    <Text style={styles.modalPatientName}>{selectedPatient.name}</Text>
                    <Text style={styles.specialty}>{selectedPatient.profession}</Text>
                    <Text style={styles.cardRating}>{selectedPatient.rating}</Text>
                  </View>
                </View>

                <Text style={styles.modalSubHeader}>Resumo Clínico:</Text>
                <View style={styles.feedbackTextContainer}>
                  <Text style={styles.feedbackText}>{selectedPatient.bio}</Text>
                </View>

                <Text style={[styles.modalSubHeader, { marginTop: 16 }]}>Histórico de Consultas Realizadas:</Text>
                {selectedPatient.consultations.map((c: any, index: number) => (
                  <View key={index} style={styles.consultationHistoryCard}>
                    <View style={styles.consultationHistoryHeader}>
                      <Text style={styles.consultationHistoryType}>{c.type}</Text>
                      <Text style={styles.consultationHistoryDate}><Ionicons aria-hidden name="calendar-outline" size={16} color={palette.indigo} /> {c.date}</Text>
                    </View>
                    <Text style={styles.consultationHistoryNotes}>{c.notes}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Navegação Inferior (Bottom Navigation) Padrão Mobile */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          accessibilityRole="button" accessibilityLabel="Agenda"
          style={[styles.bottomNavItem, activeTab === 'home' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('home')}
        >
          <Ionicons aria-hidden name="calendar-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity 
          accessibilityRole="button" accessibilityLabel="Pacientes"
          style={[styles.bottomNavItem, activeTab === 'pacientes' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('pacientes')}
        >
          <Ionicons aria-hidden name="people-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Minha Disponibilidade"
          style={[styles.bottomNavItem, activeTab === 'disponibilidade' && styles.bottomNavActive]}
          onPress={() => setActiveTab('disponibilidade')}
        >
          <Ionicons aria-hidden name="time-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity 
          accessibilityRole="button" accessibilityLabel="Perfil profissional"
          style={[styles.bottomNavItem, activeTab === 'perfil' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('perfil')}
        >
          <Ionicons aria-hidden name="person-circle-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilização adaptada para React Native (StyleSheet)
const GuardedScreen = withRouteGuard(MedicoScreen, 'medico');

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Painel Profissional</title>
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
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    maxWidth: '100%',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.white,
  },
  searchInput: {
    backgroundColor: palette.cream,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: palette.indigo,
    width: 140,
  },
  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 90,
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
  cardsGrid: {
    gap: 16,
  },
  appointmentCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  cardInfo: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    color: palette.muted,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: palette.muted,
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 12,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardRating: {
    fontSize: 12,
    color: palette.indigo,
    marginBottom: 6,
  },
  viewBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  viewDoctorBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: palette.white,
    fontWeight: 'bold',
    fontSize: 19,
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
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  bottomNavActive: {
    opacity: 1,
    backgroundColor: palette.wine,
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  modalCloseText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalPatientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  modalSubHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.indigo,
    marginTop: 12,
    marginBottom: 4,
  },
  feedbackTextContainer: {
    backgroundColor: palette.neutral,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: palette.indigo,
  },
  feedbackText: {
    fontSize: 13,
    color: palette.indigo,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  settingsNavBtnText: {
    color: palette.indigo,
    fontWeight: 'bold',
    fontSize: 12,
  },
  settingsHeaderContainer: {
    marginBottom: 16,
  },
  btnBack: {
    borderWidth: 1,
    borderColor: palette.indigo,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnBackText: {
    color: palette.indigo,
    fontWeight: 'bold',
    fontSize: 12,
  },
  earningsContainer: {
    marginBottom: 20,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 10,
  },
  earningsGrid: {
    gap: 12,
  },
  earningsCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: palette.indigo,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  earningsCardHighlight: {
    backgroundColor: palette.indigo,
    borderLeftWidth: 0,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: palette.muted,
    marginBottom: 4,
  },
  earningsLabelHighlight: {
    color: palette.salmon,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 2,
  },
  earningsValueHighlight: {
    color: palette.white,
  },
  earningsSubtext: {
    fontSize: 11,
    color: palette.indigo,
    fontWeight: 'bold',
  },
  earningsSubtextHighlight: {
    color: palette.cream,
    fontWeight: 'normal',
  },
  settingsForm: {
    gap: 16,
  },
  settingsGroup: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    gap: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 4,
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
  profileAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profileAvatarLg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: palette.indigo,
  },
  saveSettingsBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  consultationHistoryCard: {
    backgroundColor: palette.neutral,
    borderLeftWidth: 4,
    borderLeftColor: palette.indigo,
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  consultationHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consultationHistoryType: {
    fontSize: 13,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  consultationHistoryDate: {
    fontSize: 11,
    color: palette.muted,
  },
  consultationHistoryNotes: {
    fontSize: 12,
    color: palette.indigo,
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
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: palette.cream,
    color: palette.indigo,
    textAlign: 'center',
  },
  menuBackdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  menuPanel: {
    width: 280,
    maxWidth: '80%',
    backgroundColor: palette.white,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemText: {
    color: palette.indigo,
    fontSize: 16,
    fontWeight: '700',
  },
});