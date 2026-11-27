import { Head } from 'expo-router/head';
import { withRouteGuard } from '../../components/RouteGuard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FormInput } from '../../components/FormInput';
import { palette } from '../../lib/palette';
import { useRouter } from "expo-router";
import { useState } from "react";
import { api, ApiError, setAuthToken } from "../../lib/api";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function CadastroMedicoScreen() {
  const router = useRouter();
  // Estados para cada campo do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [councilNumber, setCouncilNumber] = useState("");
  const [councilUf, setCouncilUf] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const specialties = ["Psicólogo(a)", "Psiquiatra", "Psicanalista", "Neuropsicólogo(a)"];

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Lógica de envio do formulário adaptada do api.js
  const handleSubmit = async () => {
    setFeedback(null);
    if (!name.trim() || !email.trim() || !councilNumber.trim() || !password) {
      setFeedback({ text: "Preencha nome, e-mail, registro e senha.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ text: "Informe um e-mail profissional válido.", type: "error" });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setFeedback({ text: "Telefone deve conter 10 ou 11 dígitos.", type: "error" });
      return;
    }
    if (!specialty) {
      setFeedback({ text: "Selecione uma especialidade.", type: "error" });
      return;
    }
    if (councilNumber.trim().length > 15) {
      setFeedback({ text: "Registro profissional deve ter no máximo 15 caracteres.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ text: "As senhas não coincidem.", type: "error" });
      return;
    }
    setLoading(true);

    const payload = {
      nome: name,
      email: email,
      telefone: phoneDigits || null,
      especialidade: specialty,
      registro: councilNumber,
      uf: councilUf,
      descricao: description,
      senha: password,
    };

    try {
      const data = await api<{ success?: boolean; message?: string; token?: string; access_token?: string }>(
        "/api/v1/auth/register/doctor",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (data.success !== false) {
        const token = data.token ?? data.access_token;
        if (token) await setAuthToken(token);
        setFeedback({ text: data.message || "Cadastro realizado com sucesso!", type: "success" });
        router.replace("/auth/login");
      } else {
        setFeedback({ text: data.message || "Nao foi possivel realizar o cadastro.", type: "error" });
      }
    } catch (error) {
      setFeedback({
        text: error instanceof ApiError ? error.message : "Ocorreu um erro ao conectar ao servidor.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Fundos decorativos */}
      <View pointerEvents="none" style={styles.backgroundTop} />
      <View pointerEvents="none" style={styles.backgroundBottom} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
      >
        <View style={styles.container}>
          {/* Cabeçalho / Logo */}
          <View style={styles.logoTitle}>
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.brandBadge}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>EcliPsi</Text>
            </View>
            <Text style={styles.title}>Cadastro do Profissional</Text>
            <Text style={styles.subtitle}>
              Exclusivo para especialistas em Saúde Mental
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.register}>
            <View style={styles.registerForm}>
              {/* Nome Completo */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Nome Completo"
                  placeholder="Nome Completo"
                  placeholderTextColor={palette.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* E-mail Profissional */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="E-mail profissional"
                  placeholder="E-mail profissional"
                  placeholderTextColor={palette.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Telefone / WhatsApp */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Telefone / WhatsApp (DD + número)"
                  placeholder="Telefone / WhatsApp (DD + número)"
                  placeholderTextColor={palette.muted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(value) => setPhone(formatPhone(value))}
                  maxLength={15}
                />
              </View>

              {/* Especialidade / Profissão (Simulado com TextInput ou Picker) */}
              <View style={styles.sentenceLine}>
                <View style={styles.optionGroup}>
                  {specialties.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionChip, specialty === option && styles.optionChipActive]}
                      onPress={() => setSpecialty(option)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionChipText, specialty === option && styles.optionChipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Grupo para Conselho e UF */}
              <View style={styles.formRow}>
                <View style={[styles.sentenceLine, { flex: 2 }]}>
                  <FormInput
                    accessibilityLabel="Nº do Registro (CRM / CRP)"
                    placeholder="Nº do Registro (CRM / CRP)"
                    placeholderTextColor={palette.muted}
                    value={councilNumber}
                    onChangeText={setCouncilNumber}
                    maxLength={15}
                  />
                </View>
                <View
                  style={[
                    styles.sentenceLine,
                    styles.sentenceLineSm,
                    { flex: 1 },
                  ]}
                >
                  <FormInput
                    accessibilityLabel="UF"
                    placeholder="UF"
                    placeholderTextColor={palette.muted}
                    autoCapitalize="characters"
                    maxLength={2}
                    value={councilUf}
                    onChangeText={setCouncilUf}
                  />
                </View>
              </View>

              {/* Descrição / Forma de trabalhar */}
              <View style={styles.sentenceLine}>
                <FormInput
                  style={styles.textArea}
                  accessibilityLabel="Apresentação / Forma de trabalhar (opcional)"
                  placeholder="Apresentação / Forma de trabalhar (opcional)"
                  placeholderTextColor={palette.muted}
                  multiline={true}
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Senha */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Crie uma senha"
                  placeholder="Crie uma senha"
                  placeholderTextColor={palette.muted}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Confirmação de Senha */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Confirme sua senha"
                  placeholder="Confirme sua senha"
                  placeholderTextColor={palette.muted}
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Botões e Link de Login */}
              <View style={styles.btnLine}>
                {feedback ? (
                  <Text
                    accessibilityRole="alert"
                    style={[styles.feedback, feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError]}
                  >
                    {feedback.text}
                  </Text>
                ) : null}
                <PrimaryButton
                  style={styles.registerBtn}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={palette.white} />
                      <Text style={styles.registerBtnText}>Cadastrando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.registerBtnText}>Cadastrar Profissional</Text>
                  )}
                </PrimaryButton>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.replace("/auth/cadastro")}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>

                <View style={styles.loginLinkContainer}>
                  <Text style={styles.registerP}>Já possui conta? </Text>
                  <TouchableOpacity
                    onPress={() => router.replace("/auth/login")}
                  >
                    <Text style={styles.registerLink}>Clique aqui!</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const GuardedScreen = withRouteGuard(CadastroMedicoScreen);

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Cadastro Profissional</title>
      </Head>
      <GuardedScreen />
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: palette.indigo,
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    backgroundColor: palette.cream,
    zIndex: 0,
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "80%",
    backgroundColor: palette.indigo,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    zIndex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100%",
    paddingTop: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: palette.white,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    maxWidth: 500,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    shadowColor: palette.indigo,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandBadge: {
    width: 44,
    height: 44,
  },
  brandTitle: {
    color: palette.indigo,
    fontSize: 30,
    fontWeight: "900",
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  title: {
    color: palette.indigo,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: palette.wine,
    fontSize: 14,
    textAlign: "center",
  },
  register: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  registerForm: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  optionGroup: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.white,
  },
  optionChipActive: {
    backgroundColor: palette.wine,
    borderColor: palette.wine,
  },
  optionChipText: {
    color: palette.indigo,
    fontSize: 12,
  },
  optionChipTextActive: {
    color: palette.white,
  },
  sentenceLine: {
    alignItems: "flex-start",
    width: "100%",
  },
  sentenceLineSm: {
    width: "100%",
  },
  btnLine: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    marginTop: 10,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderBottomWidth: 5,
    borderBottomColor: palette.wine,
    borderRadius: 15,
    backgroundColor: palette.magenta,
  },
  feedback: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  feedbackError: {
    color: palette.wine,
    backgroundColor: palette.salmon,
  },
  feedbackSuccess: {
    color: palette.indigo,
    backgroundColor: palette.cream,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerBtnText: {
    color: palette.white,
    fontWeight: "bold",
    fontSize: 19,
    textAlign: "center",
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 15,
    backgroundColor: palette.neutral,
  },
  backBtnText: {
    color: palette.indigo,
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  registerP: {
    color: palette.muted,
    fontSize: 14,
  },
  registerLink: {
    color: palette.wine,
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});
