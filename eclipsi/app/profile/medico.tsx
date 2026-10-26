import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function MedicoScreen() {
  // Estados de navegação e modais
  const [activeTab, setActiveTab] = useState<'home' | 'pacientes' | 'perfil' | 'configuracoes'>('home');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Estados de formulários / inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  // Perfil Profissional (Mock state)
  const [profileName, setProfileName] = useState('Dra. Ana Silva');
  const [councilNumber, setCouncilNumber] = useState('CRP 06/123456');
  const [hourlyRate, setHourlyRate] = useState('200,00');
  const [profileBio, setProfileBio] = useState('Especialista em Terapia Cognitivo-Comportamental focada em transtornos de ansiedade, depressão e burnout.');

  // Dados estáticos mapeados
  const appointments = [
    {
      id: '1',
      patient: 'João da Silva',
      type: 'Sessão TCC / Primeira Consulta',
      date: '30/09/2026 às 14:00',
      price: 'R$ 200,00',
      img: 'https://via.placeholder.com/150',
      history: 'Paciente relata episódios recorrentes de ansiedade no trabalho e sintomas de burnout. Histórico sem medicações prévias.',
      preview: 'Paciente relata episódios recorrentes de ansiedade no trabalho e sintomas...',
    },
    {
      id: '2',
      patient: 'Maria Oliveira',
      type: 'Avaliação Neuropsicológica',
      date: '02/10/2026 às 10:00',
      price: 'R$ 300,00',
      img: 'https://via.placeholder.com/150',
      history: 'Sessão de aplicação de testes cognitivos para investigação de foco e memória. Encaminhada por neurologista.',
      preview: 'Sessão de aplicação de testes cognitivos para investigação de foco e memória...',
    },
  ];

  const patientsList = [
    {
      id: '1',
      name: 'João da Silva',
      profession: 'Última consulta: 15/09/2026',
      rating: '5 Atendimentos realizados',
      price: 'Plano: Individual',
      img: 'https://via.placeholder.com/150',
      bio: 'Paciente em acompanhamento semanal. Evolução positiva no manejo de crises de ansiedade. Mantém diário de pensamentos.',
      consultations: [
        { date: '15/09/2026 - 14:00', type: 'Sessão TCC / Acompanhamento', notes: 'Paciente relatou melhora nos episódios de ansiedade após início do diário de pensamentos.' },
        { date: '08/09/2026 - 14:00', type: 'Sessão TCC / Acompanhamento', notes: 'Identificados gatilhos de estresse no ambiente de trabalho.' }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#7500a8" barStyle="light-content" />

      {/* Header Fixo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>MinhaLogo | Profissional</Text>
        </View>
        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar pacientes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profileImg} />
        </View>
      </View>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        
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
                  <Image source={{ uri: item.img }} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.patient}</Text>
                    <Text style={styles.specialty}>{item.type}</Text>
                    <Text style={styles.cardDate}>🗓 {item.date}</Text>
                    <Text style={styles.cardPrice}>💰 {item.price}</Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
                    <View style={styles.viewBtn}>
                      <Text style={styles.btnText}>Ver prontuário / Laudo</Text>
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
        {activeTab === 'perfil' && (
          <View>
            <View style={styles.profileHeaderContainer}>
              <Text style={styles.pageTitle}>Perfil Profissional</Text>
              <TouchableOpacity 
                style={styles.settingsNavBtn} 
                onPress={() => setActiveTab('configuracoes')}
              >
                <Text style={styles.settingsNavBtnText}>⚙️ Configurações</Text>
              </TouchableOpacity>
            </View>

            {/* Resumo de Ganhos */}
            <View style={styles.earningsContainer}>
              <Text style={styles.earningsTitle}>📈 Resumo de Ganhos</Text>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Ganhos neste Mês (Setembro)</Text>
                  <Text style={styles.earningsValue}>R$ 4.800,00</Text>
                  <Text style={styles.earningsSubtext}>+12% em relação ao mês anterior</Text>
                </View>
                <View style={[styles.earningsCard, styles.earningsCardHighlight]}>
                  <Text style={[styles.earningsLabel, styles.earningsLabelHighlight]}>Ganhos Acumulados no Ano (2026)</Text>
                  <Text style={[styles.earningsValue, styles.earningsValueHighlight]}>R$ 52.400,00</Text>
                  <Text style={[styles.earningsSubtext, styles.earningsSubtextHighlight]}>262 consultas realizadas</Text>
                </View>
              </View>
            </View>

            {/* Formulário de Perfil */}
            <View style={styles.settingsForm}>
              <View style={styles.settingsGroup}>
                <View style={styles.profileAvatarWrapper}>
                  <Image source={{ uri: 'https://via.placeholder.com/120' }} style={styles.profileAvatarLg} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nº do Registro (CRP / CRM)</Text>
                  <TextInput style={styles.input} value={councilNumber} onChangeText={setCouncilNumber} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Valor da Consulta (R$ / hora)</Text>
                  <TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Apresentação e Abordagem Terapêutica</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    numberOfLines={4} 
                    value={profileBio} 
                    onChangeText={setProfileBio} 
                  />
                </View>

                <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => alert('Perfil atualizado com sucesso!')}>
                  <Text style={styles.btnText}>Salvar Perfil Profissional</Text>
                </TouchableOpacity>
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
                <Text style={styles.sectionSubTitle}>Acesso Profissional</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>E-mail Profissional</Text>
                  <TextInput style={styles.input} defaultValue="dra.anasilva@saudemental.com" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefone / WhatsApp</Text>
                  <TextInput style={styles.input} defaultValue="(11) 99999-8888" />
                </View>
                <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => alert('Configurações salvas!')}>
                  <Text style={styles.btnText}>Salvar Configurações</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

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

                <TouchableOpacity 
                  style={[styles.saveSettingsBtn, { marginTop: 12 }]} 
                  onPress={() => {
                    alert('Anotações salvas com sucesso!');
                    setSelectedAppointment(null);
                  }}
                >
                  <Text style={styles.btnText}>Salvar no Prontuário</Text>
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
                      <Text style={styles.consultationHistoryDate}>🗓 {c.date}</Text>
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
          style={[styles.bottomNavItem, activeTab === 'home' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.bottomNavIcon}>📅</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bottomNavItem, activeTab === 'pacientes' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('pacientes')}
        >
          <Text style={styles.bottomNavIcon}>👥</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bottomNavItem, activeTab === 'perfil' && styles.bottomNavActive]} 
          onPress={() => setActiveTab('perfil')}
        >
          <Text style={styles.bottomNavIcon}>🩺</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilização adaptada para React Native (StyleSheet)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5dfff',
  },
  header: {
    backgroundColor: '#7500a8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f5dfff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#333333',
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
    color: '#333333',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  cardsGrid: {
    gap: 16,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#333333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardRating: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 6,
  },
  viewBtn: {
    backgroundColor: '#7500a8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  viewDoctorBtn: {
    backgroundColor: '#7500a8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
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
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  bottomNavActive: {
    opacity: 1,
  },
  bottomNavIcon: {
    fontSize: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
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
    color: '#333',
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
    color: '#333',
  },
  modalSubHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  feedbackTextContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
  },
  feedbackText: {
    fontSize: 13,
    color: '#333',
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
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  settingsNavBtnText: {
    color: '#7500a8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnBack: {
    borderWidth: 1,
    borderColor: '#7500a8',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnBackText: {
    color: '#7500a8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  earningsContainer: {
    marginBottom: 20,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#58007e',
    marginBottom: 10,
  },
  earningsGrid: {
    gap: 12,
  },
  earningsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  earningsCardHighlight: {
    backgroundColor: '#7500a8',
    borderLeftWidth: 0,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  earningsLabelHighlight: {
    color: '#e2c1f7',
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7500a8',
    marginBottom: 2,
  },
  earningsValueHighlight: {
    color: '#ffffff',
  },
  earningsSubtext: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  earningsSubtextHighlight: {
    color: '#f5dfff',
    fontWeight: 'normal',
  },
  settingsForm: {
    gap: 16,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    gap: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
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
  profileAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profileAvatarLg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7500a8',
  },
  saveSettingsBtn: {
    backgroundColor: '#7500a8',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  consultationHistoryCard: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
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
    color: '#7500a8',
  },
  consultationHistoryDate: {
    fontSize: 11,
    color: '#666',
  },
  consultationHistoryNotes: {
    fontSize: 12,
    color: '#333',
  },
});