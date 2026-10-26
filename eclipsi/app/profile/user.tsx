import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function App() {
  // Estados para navegação entre abas ('home', 'consultas', 'perfil', 'configuracoes')
  const [activeTab, setActiveTab] = useState('home');

  // Estados dos Modais
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingDoctorName, setRatingDoctorName] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  // Estados do Perfil e Configurações
  const [profileName, setProfileName] = useState('João da Silva');
  const [profileBio, setProfileBio] = useState('Buscando autoconhecimento e uma rotina mais saudável.');
  const [userEmail, setUserEmail] = useState('joao.silva@email.com');
  const [userPhone, setUserPhone] = useState('(11) 98765-4321');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  // Dados Mockados para Consultas e Médicos
  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dra. Mariana Costa',
      specialty: 'Psicóloga',
      date: '10/10/2026 às 14:00',
      price: 'R$ 200,00',
      img: 'https://via.placeholder.com/150',
      status: 'Agendada',
    },
  ];

  const completedAppointments = [
    {
      id: '2',
      doctor: 'Dra. Ana Silva',
      specialty: 'Psicóloga',
      date: '28/09/2026',
      price: 'R$ 180,00',
      img: 'https://via.placeholder.com/150',
      feedback: 'Paciente apresentou excelente evolução nas sessões de TCC. Recomenda-se manter a rotina diária de diário de pensamentos e exercícios de respiração diafragmática.',
    },
    {
      id: '3',
      doctor: 'Dr. Carlos Eduardo',
      specialty: 'Psiquiatra',
      date: '15/09/2026',
      price: 'R$ 350,00',
      img: 'https://via.placeholder.com/150',
      feedback: 'Manutenção da medicação atual por mais 30 dias. Encaminhamento enviado para acompanhamento conjunto com neuropsicólogo.',
    },
  ];

  const doctorsList = [
    {
      id: 'd1',
      name: 'Dra. Camila Ribeiro',
      profession: 'Psicóloga (CRP 06/123456)',
      rating: '4.9 (48 avaliações)',
      price: 'R$ 200,00 / hora',
      img: 'https://via.placeholder.com/150',
      bio: 'Trabalho com a Terapia Cognitivo-Comportamental focada em ansiedade e burnout.',
    },
    {
      id: 'd2',
      name: 'Dr. Lucas Martins',
      profession: 'Psiquiatra (CRM 123456/SP - RQE 789)',
      rating: '4.8 (32 avaliações)',
      price: 'R$ 400,00 / hora',
      img: 'https://via.placeholder.com/150',
      bio: 'Atendimento psiquiátrico humanizado e focado em diagnóstico preciso.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#322c8e" />

      {/* Header Superior Fixo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.burgerBtn}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
          <Text style={styles.logo}>MinhaLogo</Text>
        </View>
        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#fe9e8e"
          />
          <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profileImg} />
        </View>
      </View>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'home' && (
          <View>
            <Text style={styles.pageTitle}>Página Inicial</Text>
            <Text style={styles.pageSubtitle}>Acompanhe suas consultas agendadas e seu histórico:</Text>

            {/* Próximas Consultas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <FontAwesome5 name="calendar-check" size={16} color="#7500a8" /> Próximas Consultas
              </Text>
              {upcomingAppointments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.appointmentCard}
                  onPress={() => {
                    setSelectedAppointment(item);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Image source={{ uri: item.img }} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                    <Text style={styles.specialty}>{item.specialty}</Text>
                    <Text style={styles.cardDate}>🗓 {item.date}</Text>
                    <Text style={styles.cardPrice}>💰 {item.price}</Text>
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>Ver detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            {/* Consultas Realizadas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <FontAwesome5 name="clock" size={16} color="#7500a8" /> Consultas Realizadas
              </Text>
              {completedAppointments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.appointmentCard}
                  onPress={() => {
                    setSelectedAppointment(item);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Image source={{ uri: item.img }} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                    <Text style={styles.specialty}>{item.specialty}</Text>
                    <Text style={styles.cardDate}>🗓 {item.date}</Text>
                    <Text style={styles.cardPrice}>💰 {item.price}</Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>{item.feedback}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Ver detalhes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setRatingDoctorName(item.doctor);
                          setRatingModalVisible(true);
                        }}
                      >
                        <Text style={styles.rateBtnText}>⭐ Avaliar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'consultas' && (
          <View>
            <Text style={styles.pageTitle}>Buscar Consultas</Text>
            <Text style={styles.pageSubtitle}>Encontre o profissional ideal para o seu acompanhamento:</Text>
            {doctorsList.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.doctorCard}
                onPress={() => {
                  setSelectedDoctor(doc);
                  setDoctorModalVisible(true);
                }}
              >
                <Image source={{ uri: doc.img }} style={styles.cardImg} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDoctorName}>{doc.name}</Text>
                  <Text style={styles.specialty}>{doc.profession}</Text>
                  <Text style={styles.cardRating}>⭐ {doc.rating}</Text>
                  <Text style={styles.cardPrice}>💰 {doc.price}</Text>
                  <Text style={styles.cardPreview} numberOfLines={2}>{doc.bio}</Text>
                  <TouchableOpacity style={styles.viewDoctorBtn}>
                    <Text style={styles.viewDoctorBtnText}>Ver perfil completo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
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
                <FontAwesome5 name="cog" size={14} color="#7500a8" />
                <Text style={styles.settingsNavBtnText}>Configurações</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsGroup}>
              <View style={styles.profileAvatarWrapper}>
                <Image source={{ uri: 'https://via.placeholder.com/120' }} style={styles.profileAvatarLg} />
                <TouchableOpacity style={styles.avatarUploadBtn}>
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

              <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => alert('Perfil salvo com sucesso!')}>
                <Text style={styles.saveSettingsBtnText}>Salvar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'configuracoes' && (
          <View>
            <View style={styles.settingsHeaderContainer}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setActiveTab('perfil')}>
                <FontAwesome5 name="arrow-left" size={16} color="#7500a8" />
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

              <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => alert('Configurações salvas!')}>
                <Text style={styles.saveSettingsBtnText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navegação Inferior (Bottom Navigation) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <FontAwesome5 name="house-user" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'consultas' && styles.navItemActive]}
          onPress={() => setActiveTab('consultas')}
        >
          <FontAwesome5 name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'perfil' && styles.navItemActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <FontAwesome5 name="user" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Modal de Detalhes da Consulta */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>
            {selectedAppointment && (
              <View>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedAppointment.img }} style={styles.modalImg} />
                  <View>
                    <Text style={styles.cardDoctorName}>{selectedAppointment.doctor}</Text>
                    <Text style={styles.specialty}>{selectedAppointment.specialty}</Text>
                  </View>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.label}>Data: <Text style={styles.normalText}>{selectedAppointment.date}</Text></Text>
                  <Text style={styles.label}>Valor: <Text style={styles.normalText}>{selectedAppointment.price}</Text></Text>
                  {selectedAppointment.feedback && (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.label}>Anotações do profissional:</Text>
                      <Text style={styles.feedbackText}>{selectedAppointment.feedback}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Avaliação */}
      <Modal visible={ratingModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Avaliar Atendimento</Text>
            <Text style={styles.specialty}>{ratingDoctorName}</Text>
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
              onPress={() => {
                alert('Avaliação enviada com sucesso!');
                setRatingModalVisible(false);
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
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffeec2',
  },
  header: {
    backgroundColor: '#322c8e',
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
    backgroundColor: '#f80174',
    borderRadius: 2,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 14,
    color: '#fe9e8e',
    width: 120,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#322c8e',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  homeSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7500a8',
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0b0ff',
    marginVertical: 24,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#322c8e',
  },
  specialty: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: '#ff3131',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    color: '#ff3131',
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  cardRating: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  upcomingBadgeText: {
    color: '#0d47a1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: '#322c8e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rateBtn: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewDoctorBtn: {
    backgroundColor: '#7500a8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewDoctorBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#7500a8',
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
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
    color: '#666666',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalBody: {
    gap: 8,
  },
  feedbackBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  normalText: {
    fontWeight: 'normal',
    color: '#333333',
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsNavBtn: {
    borderWidth: 1,
    borderColor: '#7500a8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsNavBtnText: {
    color: '#7500a8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
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
    borderColor: '#7500a8',
  },
  avatarUploadBtn: {
    backgroundColor: '#f5dfff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avatarUploadBtnText: {
    color: '#7500a8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveSettingsBtn: {
    backgroundColor: '#7500a8',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveSettingsBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
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
    color: '#7500a8',
    fontWeight: 'bold',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7500a8',
    borderBottomWidth: 2,
    borderBottomColor: '#f5dfff',
    paddingBottom: 4,
  },
});