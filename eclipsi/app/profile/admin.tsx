import React, { useState, useEffect } from 'react';
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

export default function AdminScreen() {
  // Estados para navegação e controle de abas/sidebar
  const [activeTab, setActiveTab] = useState('usuarios');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de dados da API
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_pacientes: 0,
    total_medicos: 0,
    receita: {},
    especialidades: {},
  });
  const [adminProfile, setAdminProfile] = useState({ nome: '', email: '' });
  const [adminPassword, setAdminPassword] = useState('');

  // Estados de Busca e Edição de Usuários
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Carregamento inicial de dados equivalentes ao DOMContentLoaded
  useEffect(() => {
    loadUsers();
    loadStats();
    loadAdminProfile();
  }, []);

  // Funções de API simuladas / adaptadas para React Native (fetch)
  const loadUsers = async (query = '') => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        let filtered = data.users;
        if (query) {
          filtered = filtered.filter(
            (u: any) =>
              u.nome.toLowerCase().includes(query.toLowerCase()) ||
              u.email.toLowerCase().includes(query.toLowerCase())
          );
        }
        setUsers(filtered);
      }
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
    }
  };

  const loadAdminProfile = async () => {
    try {
      // Simulação de obtenção do ID via armazenamento local ou contexto
      const res = await fetch(`/api/admin/profile?id=1`);
      const data = await res.json();
      if (data.success) {
        setAdminProfile({
          nome: data.admin.nome || '',
          email: data.admin.email || '',
        });
      }
    } catch (e) {
      console.error('Erro ao carregar perfil do administrador:', e);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setEditModalVisible(false);
        loadUsers();
      }
    } catch (err) {
      alert('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setEditModalVisible(false);
        loadUsers();
      }
    } catch (e) {
      alert('Erro ao excluir o perfil.');
    }
  };

  const handleUpdateAdminProfile = async () => {
    try {
      const data = {
        id: 1,
        nome: adminProfile.nome,
        email: adminProfile.email,
        senha: adminPassword,
      };
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      alert(result.message);
    } catch (err) {
      alert('Erro ao atualizar perfil de administrador.');
    }
  };

  const brl = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#7500a8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.burgerBtn}
            onPress={() => setSidebarOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
          <Text style={styles.logo}>MinhaLogo | Administrador</Text>
        </View>

        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários..."
            placeholderTextColor="#666"
            maxLength={100}
            onChangeText={(text) => {
              setSearchQuery(text);
              loadUsers(text);
            }}
            value={searchQuery}
          />
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profileImg}
          />
        </View>
      </View>

      {/* Overlay e Sidebar (Menu Lateral) */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      <View style={[styles.sidebar, sidebarOpen && styles.sidebarOpen]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu Painel Admin</Text>
          <TouchableOpacity onPress={() => setSidebarOpen(false)}>
            <Text style={styles.closeBtn}>&times;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarNav}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'usuarios' && styles.navItemActive]}
            onPress={() => {
              setActiveTab('usuarios');
              setSidebarOpen(false);
            }}
          >
            <Text style={[styles.navItemText, activeTab === 'usuarios' && styles.navItemTextActive]}>
              Gestão de Usuários
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'estatisticas' && styles.navItemActive]}
            onPress={() => {
              setActiveTab('estatisticas');
              setSidebarOpen(false);
            }}
          >
            <Text style={[styles.navItemText, activeTab === 'estatisticas' && styles.navItemTextActive]}>
              Estatísticas Gerais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'perfil' && styles.navItemActive]}
            onPress={() => {
              setActiveTab('perfil');
              setSidebarOpen(false);
            }}
          >
            <Text style={[styles.navItemText, activeTab === 'perfil' && styles.navItemTextActive]}>
              Perfil e Configurações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.logoutItem]}
            onPress={() => {
              setActiveTab('sair');
              setSidebarOpen(false);
            }}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo Principal */}
      <ScrollView style={styles.contentContainer}>
        {/* Aba 1: Gestão de Usuários */}
        {activeTab === 'usuarios' && (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Gerenciamento de Usuários</Text>
            <Text style={styles.pageSubtitle}>Visualize e gerencie as contas cadastradas na plataforma:</Text>

            <TextInput
              style={styles.subSearchInput}
              placeholder="Buscar por nome ou e-mail..."
              placeholderTextColor="#888"
              maxLength={100}
              onChangeText={(text) => loadUsers(text)}
            />

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Usuário</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>E-mail</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Tipo</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Ações</Text>
              </View>

              {users.map((user, index) => {
                const isMed = user.role === 'medico';
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{user.nome}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{user.email}</Text>
                    <View style={{ flex: 1.5 }}>
                      <View style={[styles.badge, isMed ? styles.badgeMed : styles.badgePac]}>
                        <Text style={[styles.badgeText, isMed ? styles.badgeTextMed : styles.badgeTextPac]}>
                          {user.role}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        style={styles.btnEditUser}
                        onPress={() => {
                          setSelectedUser({ ...user });
                          setEditModalVisible(true);
                        }}
                      >
                        <Text style={styles.btnEditText}>Editar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Aba 2: Estatísticas */}
        {activeTab === 'estatisticas' && (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Estatísticas Globais</Text>
            <Text style={styles.pageSubtitle}>Métricas financeiras e fluxo de cadastros na plataforma:</Text>

            <View style={styles.earningsContainer}>
              <Text style={styles.earningsTitle}>Arrecadação Financeira</Text>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Arrecadado neste Mês</Text>
                  <Text style={styles.earningsValue}>{brl(stats.receita?.mes_atual)}</Text>
                  <Text style={styles.earningsSubtext}>
                    {stats.receita?.variacao_pct == null
                      ? 'Sem dados do mês anterior'
                      : `${stats.receita?.variacao_pct >= 0 ? '+' : ''}${stats.receita?.variacao_pct}% que o mês anterior`}
                  </Text>
                </View>

                <View style={[styles.earningsCard, styles.earningsCardHighlight]}>
                  <Text style={[styles.earningsLabel, styles.highlightText]}>
                    Arrecadado no Ano ({stats.receita?.ano_ref})
                  </Text>
                  <Text style={[styles.earningsValue, styles.highlightValue]}>{brl(stats.receita?.ano)}</Text>
                  <Text style={[styles.earningsSubtext, styles.highlightSub]}>
                    Taxa: {brl(stats.receita?.taxa_ano)} · Repasses: {brl(stats.receita?.repasse_ano)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.earningsContainer, { marginTop: 24 }]}>
              <Text style={styles.earningsTitle}>Cadastros no Banco de Dados</Text>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Usuários Comuns (Pacientes)</Text>
                  <Text style={styles.earningsValue}>{stats.total_pacientes}</Text>
                  <Text style={styles.earningsSubtext}>Total registrado na base</Text>
                </View>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Médicos / Profissionais</Text>
                  <Text style={styles.earningsValue}>{stats.total_medicos}</Text>
                  <Text style={styles.earningsSubtext}>Total registrado na base</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <Text style={styles.earningsTitle}>Profissionais por Especialidade</Text>
              <View style={styles.statsCategoryGrid}>
                {Object.keys(stats.especialidades || {}).length === 0 ? (
                  <Text style={{ color: '#666' }}>Nenhum profissional cadastrado por enquanto.</Text>
                ) : (
                  Object.entries(stats.especialidades || {}).map(([esp, count]: [string, any], idx) => {
                    const totalMedicos = stats.total_medicos || 1;
                    const percentage = ((count / totalMedicos) * 100).toFixed(1);
                    const espName = esp.charAt(0).toUpperCase() + esp.slice(1);

                    return (
                      <View key={idx} style={styles.categoryCard}>
                        <Text style={styles.categoryCardTitle}>{espName}s</Text>
                        <Text style={styles.categoryCardCount}>{count}</Text>
                        <Text style={styles.categoryCardSub}>{percentage}% do total</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        )}

        {/* Aba 3: Perfil do Administrador */}
        {activeTab === 'perfil' && (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Perfil do Administrador</Text>
            <Text style={styles.pageSubtitle}>Gerencie e altere as configurações da sua conta de Administrador:</Text>

            <View style={styles.settingsForm}>
              <View style={styles.settingsGroup}>
                <View style={styles.profileAvatarWrapper}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/120' }}
                    style={styles.profileAvatarLg}
                  />
                  <TouchableOpacity style={styles.avatarUploadBtn}>
                    <Text style={styles.avatarUploadText}>Alterar Foto</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nome Completo</Text>
                  <TextInput
                    style={styles.formInput}
                    value={adminProfile.nome}
                    onChangeText={(text) => setAdminProfile({ ...adminProfile, nome: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>E-mail Corporativo</Text>
                  <TextInput
                    style={styles.formInput}
                    value={adminProfile.email}
                    keyboardType="email-address"
                    onChangeText={(text) => setAdminProfile({ ...adminProfile, email: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nova Senha</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Deixe em branco para manter a atual"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={adminPassword}
                    onChangeText={setAdminPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveSettingsBtn}
                  onPress={handleUpdateAdminProfile}
                >
                  <Text style={styles.saveSettingsText}>Salvar Alterações do Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Aba 4: Sair */}
        {activeTab === 'sair' && (
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Sessão Encerrada</Text>
            <Text style={styles.pageSubtitle}>Você desconectou da conta do Administrador.</Text>
          </View>
        )}
      </ScrollView>

      {/* Navegação Inferior (Mobile Footer Navbar) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'usuarios' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('usuarios')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'usuarios' && styles.bottomNavIconActive]}>👥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'estatisticas' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('estatisticas')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'estatisticas' && styles.bottomNavIconActive]}>📈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomNavItem, activeTab === 'perfil' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <Text style={[styles.bottomNavIcon, activeTab === 'perfil' && styles.bottomNavIconActive]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Edição de Usuário */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Perfil do Usuário</Text>
            <Text style={styles.modalSub}>Edite as informações abaixo ou remova a conta.</Text>

            {selectedUser && (
              <ScrollView style={{ marginTop: 12 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nome Completo</Text>
                  <TextInput
                    style={styles.formInput}
                    value={selectedUser.nome}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, nome: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>E-mail</Text>
                  <TextInput
                    style={styles.formInput}
                    value={selectedUser.email}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, email: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Registro / CRM / CRP</Text>
                  <TextInput
                    style={styles.formInput}
                    value={selectedUser.registro}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, registro: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Telefone / Contato</Text>
                  <TextInput
                    style={styles.formInput}
                    value={selectedUser.telefone}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, telefone: text })}
                  />
                </View>

                <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleUpdateUser}>
                  <Text style={styles.saveSettingsText}>Salvar Alterações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnDeleteUser} onPress={handleDeleteUser}>
                  <Text style={styles.btnDeleteUserText}>Excluir Perfil Permanentemente</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    paddingVertical: 12,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  burgerBtn: {
    padding: 4,
    justifyContent: 'space-between',
    height: 20,
    width: 24,
  },
  burgerLine: {
    width: 24,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 90,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: -280,
    width: 280,
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sidebarOpen: {
    left: 0,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#7500a8',
  },
  sidebarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#ffffff',
    fontSize: 28,
  },
  sidebarNav: {
    paddingVertical: 16,
  },
  navItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  navItemActive: {
    backgroundColor: '#f5dfff',
  },
  navItemText: {
    fontSize: 16,
    color: '#333333',
  },
  navItemTextActive: {
    color: '#7500a8',
    fontWeight: 'bold',
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#d9534f',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  pageContent: {
    marginBottom: 80,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7500a8',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  subSearchInput: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5dfff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#7500a8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 13,
    color: '#333333',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeMed: { backgroundColor: '#f3e5f5' },
  badgePac: { backgroundColor: '#e3f2fd' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  badgeTextMed: { color: '#7500a8' },
  badgeTextPac: { color: '#1976d2' },
  btnEditUser: {
    backgroundColor: '#7500a8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnEditText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  earningsContainer: {
    marginTop: 10,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#58007e',
    marginBottom: 12,
  },
  earningsGrid: {
    gap: 16,
  },
  earningsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  earningsCardHighlight: {
    backgroundColor: '#7500a8',
    borderLeftWidth: 0,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 6,
  },
  highlightText: { color: '#e2c1f7' },
  earningsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7500a8',
    marginBottom: 4,
  },
  highlightValue: { color: '#ffffff' },
  earningsSubtext: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  highlightSub: { color: '#f5dfff', fontWeight: 'normal' },
  statsCategoryGrid: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: '#7500a8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardTitle: {
    color: '#555',
    fontSize: 13,
    marginBottom: 8,
  },
  categoryCardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7500a8',
  },
  categoryCardSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  settingsForm: {
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileAvatarWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  profileAvatarLg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7500a8',
  },
  avatarUploadBtn: {
    backgroundColor: '#f5dfff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  avatarUploadText: {
    color: '#7500a8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  saveSettingsBtn: {
    backgroundColor: '#7500a8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveSettingsText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
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
    zIndex: 100,
  },
  bottomNavItem: {
    opacity: 0.6,
    padding: 10,
  },
  bottomNavItemActive: {
    opacity: 1,
  },
  bottomNavIcon: {
    fontSize: 22,
  },
  bottomNavIconActive: {
    fontSize: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  btnDeleteUser: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnDeleteUserText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});