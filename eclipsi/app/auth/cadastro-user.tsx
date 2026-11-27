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

function CadastroUserScreen() {
  const router = useRouter();
  // Estados para capturar os dados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Lógica de submissão baseada no seu script.js / api.js
  const handleRegister = async () => {
    setFeedback(null);
    if (!name.trim() || !email.trim() || !password) {
      setFeedback({ text: "Preencha nome, e-mail e senha.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ text: "Informe um e-mail válido.", type: "error" });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setFeedback({ text: "Telefone deve conter 10 ou 11 dígitos.", type: "error" });
      return;
    }
    if (!gender) {
      setFeedback({ text: "Selecione uma opção de gênero.", type: "error" });
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
      idade: age ? Number(age) : null,
      genero: gender,
      senha: password,
    };

    try {
      const data = await api<{ success?: boolean; message?: string; token?: string; access_token?: string }>(
        "/api/v1/auth/register/user",
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
    <View style={styles.containerMain}>
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
          {/* Logo e Título */}
          <View style={styles.logoTitle}>
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.brandBadge}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>EcliPsi</Text>
            </View>
            <Text style={styles.title}>Cadastro</Text>
          </View>

          {/* Formulário */}
          <View style={styles.register}>
            <View style={styles.registerForm}>
              {/* Nome */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Coloque seu nome"
                  placeholder="Coloque seu nome"
                  placeholderTextColor={palette.muted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* E-mail */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Coloque seu email"
                  placeholder="Coloque seu email"
                  placeholderTextColor={palette.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Telefone */}
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

              {/* Idade e Gênero (Lado a lado) */}
              <View style={styles.formRow}>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  <FormInput
                    accessibilityLabel="Idade"
                    placeholder="Idade"
                    placeholderTextColor={palette.muted}
                    keyboardType="numeric"
                    maxLength={3}
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  <View style={styles.optionGroup}>
                    {["Feminino", "Masculino", "Outro", "Prefiro não informar"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.optionChip, gender === option && styles.optionChipActive]}
                        onPress={() => setGender(option)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.optionChipText, gender === option && styles.optionChipTextActive]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Senha */}
              <View style={styles.sentenceLine}>
                <FormInput
                  accessibilityLabel="Coloque sua senha"
                  placeholder="Coloque sua senha"
                  placeholderTextColor={palette.muted}
                  secureTextEntry
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
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Botões e Links */}
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
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={palette.white} />
                      <Text style={styles.registerBtnText}>Cadastrando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.registerBtnText}>Cadastrar-se!</Text>
                  )}
                </PrimaryButton>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.replace("/auth/cadastro")}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>

                <Text style={styles.registerP}>
                  Já fez um cadastro?{" "}
                  <Text
                    style={styles.registerLink}
                    onPress={() => router.replace("/auth/login")}
                  >
                    Clique aqui!
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const GuardedScreen = withRouteGuard(CadastroUserScreen);

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Cadastro de Paciente</title>
      </Head>
      <GuardedScreen />
    </>
  );
}

const styles = StyleSheet.create({
  containerMain: {
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
    justifyContent: "flex-start",
    minHeight: "100%",
    alignItems: "center",
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
    flexDirection: "column",
    width: "90%",
    maxWidth: 500,
    gap: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
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
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  title: {
    color: palette.indigo,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  register: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  registerForm: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  btnLine: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    marginTop: 10,
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
  registerP: {
    color: "#334155",
    fontSize: 14,
    textAlign: "center",
  },
  registerLink: {
    color: palette.wine,
    textDecorationLine: "underline",
    fontWeight: "bold",
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
});
