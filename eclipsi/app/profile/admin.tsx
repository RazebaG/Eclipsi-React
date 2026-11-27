import { Head } from 'expo-router/head';
import { withRouteGuard, useLogout } from '../../components/RouteGuard';
import { palette } from '../../lib/palette';
import React, { useState, useEffect } from 'react';
import { api, ApiError, setProfileAvatar, subscribeProfileAvatar } from '../../lib/api';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const avatar = require('../../assets/images/avatar.png');

function AdminScreen() {
  const logout = useLogout();
  // Estados para navegação e controle de abas/sidebar
  const [activeTab, setActiveTab] = useState('usuarios');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de dados da API
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    pacientes: 0,
    medicos: 0,
    pagamentos: { valor: 0, taxa_plataforma: 0, repasse: 0 },
    especialidades: {},
  });
  const [adminProfile, setAdminProfile] = useState({ nome: '', email: '' });
  const [adminPhoto, setAdminPhoto] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // Estados de Busca e Edição de Usuários
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Funções de API simuladas / adaptadas para React Native (fetch)
  const loadUsers = async (query = '') => {
    try {
      const data = await api<{ success?: boolean; users?: any[] }>('/api/v1/admin/users');
      if (data.success) {
        let filtered = data.users ?? [];
        if (query) {
          filtered = filtered.filter(
            (u: any) =>
              String(u.nome ?? '').toLowerCase().includes(query.toLowerCase()) ||
              String(u.email ?? '').toLowerCase().includes(query.toLowerCase())
          );
        }
        setUsers(filtered);
      }
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Nao foi possivel carregar os usuarios.');
    }
  };

  const loadStats = async () => {
    try {
      const data = await api<{ success?: boolean; stats?: any }>('/api/v1/admin/stats');
      if (data.success) {
        setStats(data.stats ?? {});
      }
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Nao foi possivel carregar as estatisticas.');
    }
  };

  const loadAdminProfile = async () => {
    try {
      const data = await api<{ success?: boolean; user?: { nome?: string; email?: string; foto?: string } }>('/api/me');
      if (data.success) {
        setAdminProfile({
          nome: data.user?.nome || '',
          email: data.user?.email || '',
        });
        setAdminPhoto(data.user?.foto || null);
        setProfileAvatar(data.user?.foto || null);
      }
    } catch (e) {
      console.error('Erro ao carregar perfil do administrador:', e);
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Nao foi possivel carregar o perfil.');
    }
  };

  // Carregamento inicial de dados equivalentes ao DOMContentLoaded
  /* eslint-disable react-hooks/set-state-in-effect -- os dados sao carregados por chamadas externas ao montar a tela */
  useEffect(() => {
    const unsubscribeAvatar = subscribeProfileAvatar(setAdminPhoto);
    loadUsers();
    loadStats();
    loadAdminProfile();
    return unsubscribeAvatar;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const result = await api<{ success?: boolean; message?: string }>(`/api/v1/admin/users/${encodeURIComponent(selectedUser.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: selectedUser.role }),
      });
      Alert.alert(result.message || 'Usuario atualizado.');
      if (result.success) {
        setEditModalVisible(false);
        loadUsers();
      }
    } catch (err) {
      Alert.alert('Erro', err instanceof ApiError ? err.message : 'Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const result = await api<{ success?: boolean; message?: string }>(`/api/v1/admin/users/${encodeURIComponent(selectedUser.id)}`, { method: 'DELETE' });
      Alert.alert(result.message || 'Usuario excluido.');
      if (result.success) {
        setEditModalVisible(false);
        loadUsers();
      }
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Erro ao excluir o perfil.');
    }
  };

  const handleUpdateAdminProfile = async () => {
    try {
      const result = await api<{ success?: boolean; message?: string }>('/api/v1/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({ nome: adminProfile.nome, ...(adminPhoto ? { foto: adminPhoto } : {}) }),
      });
      Alert.alert(result.message || 'Perfil atualizado.');
    } catch (err) {
      Alert.alert('Erro', err instanceof ApiError ? err.message : 'Erro ao atualizar perfil de administrador.');
    }
  };

  const chooseAdminPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri;
      setAdminPhoto(uri);
      setProfileAvatar(uri);
    }
  };

  const brl = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar  barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerLeft, { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }]}>
          <TouchableOpacity
            style={[styles.burgerBtn, { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", padding: 0 }]}
            accessibilityLabel="Abrir menu"
            onPress={() => setSidebarOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons aria-hidden name="menu" size={26} color={palette.white} />
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text style={styles.logo}>EcliPsi</Text>
          <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMINISTRADOR</Text></View>
        </View>

        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários..."
            placeholderTextColor={palette.muted}
            maxLength={100}
            onChangeText={(text) => {
              setSearchQuery(text);
              loadUsers(text);
            }}
            value={searchQuery}
          />
          <Image
            source={adminPhoto ? { uri: adminPhoto } : avatar}
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
            accessibilityRole="button" accessibilityLabel="Sair"
            style={[styles.navItem, styles.logoutItem]}
            onPress={logout}
          >
            <Text style={styles.logoutText}><Ionicons aria-hidden name="log-out-outline" size={17} color={palette.wine} /> Sair</Text>
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
              placeholderTextColor={palette.muted}
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
                const role = String(user.role || '').toLowerCase();
                const badgeStyle = role === 'admin'
                  ? styles.badgeAdmin
                  : (role === 'medico' || role === 'profissional')
                    ? styles.badgeMed
                    : styles.badgePac;
                const badgeTextStyle = role === 'admin'
                  ? styles.badgeTextAdmin
                  : (role === 'medico' || role === 'profissional')
                    ? styles.badgeTextMed
                    : styles.badgeTextPac;
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{user.nome}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{user.email}</Text>
                    <View style={{ flex: 1.5 }}>
                      <View style={[styles.badge, badgeStyle]}>
                        <Text style={[styles.badgeText, badgeTextStyle]}>
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
                  <Text style={styles.earningsValue}>{brl(stats.pagamentos?.valor)}</Text>
                  <Text style={styles.earningsSubtext}>Valor total registrado</Text>
                </View>

                <View style={[styles.earningsCard, styles.earningsCardHighlight]}>
                  <Text style={[styles.earningsLabel, styles.highlightText]}>
                    Taxa da plataforma
                  </Text>
                  <Text style={[styles.earningsValue, styles.highlightValue]}>{brl(stats.pagamentos?.taxa_plataforma)}</Text>
                  <Text style={[styles.earningsSubtext, styles.highlightSub]}>
                    Repasse: {brl(stats.pagamentos?.repasse)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.earningsContainer, { marginTop: 24 }]}>
              <Text style={styles.earningsTitle}>Cadastros no Banco de Dados</Text>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Usuários Comuns (Pacientes)</Text>
                  <Text style={styles.earningsValue}>{stats.pacientes}</Text>
                  <Text style={styles.earningsSubtext}>Total registrado na base</Text>
                </View>
                <View style={styles.earningsCard}>
                  <Text style={styles.earningsLabel}>Médicos / Profissionais</Text>
                  <Text style={styles.earningsValue}>{stats.medicos}</Text>
                  <Text style={styles.earningsSubtext}>Total registrado na base</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <Text style={styles.earningsTitle}>Profissionais por Especialidade</Text>
              <View style={styles.statsCategoryGrid}>
                {(() => {
                  const especialidades = Array.isArray(stats.especialidades)
                    ? stats.especialidades
                    : Object.entries(stats.especialidades || {}).map(([especialidade, total]) => ({ especialidade, total }));
                  return especialidades.length === 0 ? (
                  <Text style={{ color: palette.muted }}>Nenhum profissional cadastrado por enquanto.</Text>
                  ) : especialidades.map((item: any, idx: number) => {
                    const esp = String(item.especialidade || item.nome || 'Não informada');
                    const count = Number(item.total ?? item.count ?? 0);
                    const totalMedicos = stats.medicos || 1;
                    const percentage = ((count / totalMedicos) * 100).toFixed(1);

                    return (
                      <View key={idx} style={styles.categoryCard}>
                        <Text style={styles.categoryCardTitle}>{esp}</Text>
                        <Text style={styles.categoryCardCount}>{count}</Text>
                        <Text style={styles.categoryCardSub}>{percentage}% do total</Text>
                      </View>
                    );
                  });
                })()}
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
                    source={adminPhoto ? { uri: adminPhoto } : avatar}
                    style={styles.profileAvatarLg}
                  />
                  <TouchableOpacity style={styles.avatarUploadBtn} onPress={chooseAdminPhoto}>
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
                    placeholderTextColor={palette.muted}
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
      </ScrollView>

      {/* Navegação Inferior (Mobile Footer Navbar) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Usuários"
          style={[styles.bottomNavItem, activeTab === 'usuarios' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('usuarios')}
        >
          <Ionicons aria-hidden name="people-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Estatísticas"
          style={[styles.bottomNavItem, activeTab === 'estatisticas' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('estatisticas')}
        >
          <Ionicons aria-hidden name="stats-chart-outline" size={22} color={palette.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Perfil administrativo"
          style={[styles.bottomNavItem, activeTab === 'perfil' && styles.bottomNavItemActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <Ionicons aria-hidden name="settings-outline" size={22} color={palette.cream} />
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

const GuardedScreen = withRouteGuard(AdminScreen, 'admin');

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Administração</title>
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    maxWidth: '100%',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    marginLeft: 'auto',
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
    backgroundColor: palette.white,
    borderRadius: 2,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.white,
  },
  adminBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: palette.salmon,
  },
  adminBadgeText: {
    color: palette.indigo,
    fontSize: 10,
    fontWeight: '900',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: palette.white,
    zIndex: 100,
    elevation: 10,
    shadowColor: palette.indigo,
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
    backgroundColor: palette.indigo,
  },
  sidebarTitle: {
    color: palette.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: palette.white,
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
    backgroundColor: palette.wine,
    borderRadius: 12,
  },
  navItemText: {
    fontSize: 16,
    color: palette.indigo,
  },
  navItemTextActive: {
    color: palette.white,
    fontWeight: 'bold',
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: palette.wine,
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
    color: palette.indigo,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: palette.muted,
    marginBottom: 16,
  },
  subSearchInput: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: palette.white,
  },
  tableContainer: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: palette.cream,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: palette.indigo,
    fontWeight: 'bold',
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableCell: {
    fontSize: 13,
    color: palette.indigo,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeAdmin: { backgroundColor: palette.salmon },
  badgeMed: { backgroundColor: palette.cream },
  badgePac: { backgroundColor: palette.neutral },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  badgeTextAdmin: { color: palette.indigo },
  badgeTextMed: { color: palette.indigo },
  badgeTextPac: { color: palette.muted },
  btnEditUser: {
    backgroundColor: palette.indigo,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnEditText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  earningsContainer: {
    marginTop: 10,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 12,
  },
  earningsGrid: {
    gap: 16,
  },
  earningsCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: palette.indigo,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  earningsCardHighlight: {
    backgroundColor: palette.indigo,
    borderLeftWidth: 0,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: palette.muted,
    marginBottom: 6,
  },
  highlightText: { color: palette.salmon },
  earningsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: palette.indigo,
    marginBottom: 4,
  },
  highlightValue: { color: palette.white },
  earningsSubtext: {
    fontSize: 11,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  highlightSub: { color: palette.cream, fontWeight: 'normal' },
  statsCategoryGrid: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: palette.white,
    borderRadius: 10,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: palette.indigo,
    shadowColor: palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardTitle: {
    color: palette.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  categoryCardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  categoryCardSub: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 4,
  },
  settingsForm: {
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: palette.indigo,
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
    borderColor: palette.indigo,
  },
  avatarUploadBtn: {
    backgroundColor: palette.cream,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  avatarUploadText: {
    color: palette.indigo,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: palette.muted,
  },
  formInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: palette.white,
    color: palette.indigo,
  },
  saveSettingsBtn: {
    backgroundColor: palette.magenta,
    borderBottomWidth: 3,
    borderBottomColor: palette.wine,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveSettingsText: {
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
    zIndex: 100,
  },
  bottomNavItem: {
    opacity: 0.6,
    padding: 10,
  },
  bottomNavItemActive: {
    opacity: 1,
    backgroundColor: palette.wine,
    borderRadius: 12,
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
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: palette.indigo,
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
    color: palette.indigo,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.indigo,
  },
  modalSub: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 2,
  },
  btnDeleteUser: {
    backgroundColor: palette.wine,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnDeleteUserText: {
    color: palette.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});