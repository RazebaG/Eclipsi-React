import { Head } from 'expo-router/head';
import { AcademicDemoNotice } from '../../components/AcademicDemoNotice';
import { getVerifiedRole, profileRoutes } from '../../lib/auth';
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

function LoginScreen() {
  const router = useRouter();
  // Estados para capturar os inputs do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Função auxiliar para validar o formato do e-mail
  const validarEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Lógica de submissão e autenticação adaptada do api.js e script.js
  const handleLogin = async () => {
    setFeedback("");
    const trimmedEmail = email.trim();

    if (!validarEmail(trimmedEmail)) {
      setFeedback("Por favor, insira um e-mail válido.");
      return;
    }

    if (!password) {
      setFeedback("Por favor, digite sua senha.");
      return;
    }
    setLoading(true);

    const payload = {
      email: trimmedEmail,
      senha: password,
    };

    try {
      const data = await api<{
        success?: boolean;
        message?: string;
        token?: string;
        access_token?: string;
      }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        const token = data.token ?? data.access_token;
        if (!token) {
          throw new ApiError("O servidor nao retornou o token.", 401);
        }
        const role = await getVerifiedRole(token);
        await setAuthToken(token);
        router.replace(profileRoutes[role]);
      } else {
        setFeedback(data.message || "E-mail ou senha incorretos.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Ocorreu um erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fundo superior (cor clara) */}
      <View pointerEvents="none" style={styles.backgroundTop} />

      {/* Fundo inferior com curva (cor escura) */}
      <View pointerEvents="none" style={styles.backgroundBottom} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.container}>
        {/* Cabeçalho com Logo e Título */}
        <View style={styles.logoTitle}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.brandBadge}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>EcliPsi</Text>
          </View>
          <Text style={styles.title}>Login</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.register}>
          <View style={styles.registerForm}>
            <View style={styles.sentenceLine}>
              <FormInput
                accessibilityLabel="Digite seu e-mail"
                placeholder="Digite seu e-mail"
                placeholderTextColor={palette.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.sentenceLine}>
              <FormInput
                accessibilityLabel="Digite sua senha"
                placeholder="Digite sua senha"
                placeholderTextColor={palette.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.btnLine}>
              {feedback ? (
                <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text>
              ) : null}
              <PrimaryButton
                style={styles.registerBtn}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={palette.white} />
                    <Text style={styles.btnTextBold}>Entrando...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnTextBold}>Entrar</Text>
                )}
              </PrimaryButton>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.replace("/")}
              >
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>

              <Text style={styles.registerP}>
                Ainda não tem conta?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => router.push("/auth/cadastro")}
                >
                  Cadastre-se
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <AcademicDemoNotice />
      </View>
      </ScrollView>
    </View>
  );
}

const GuardedScreen = withRouteGuard(LoginScreen);

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Entrar</title>
      </Head>
      <GuardedScreen />
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: palette.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingBottom: 32,
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
    height: "70%",
    backgroundColor: palette.indigo,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: palette.white,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: 500,
    width: "90%",
    gap: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.indigo,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  brandTitle: {
    color: palette.indigo,
    fontSize: 32,
    fontWeight: "900",
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
  title: {
    color: palette.indigo,
    fontSize: 30,
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
  sentenceLine: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  btnLine: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 0,
    borderBottomWidth: 5,
    borderBottomColor: palette.wine,
    borderRadius: 15,
    backgroundColor: palette.magenta,
    width: "100%",
  },
  btnTextBold: {
    fontWeight: "bold",
    color: palette.white,
    fontSize: 19,
    textAlign: "center",
  },
  feedback: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    textAlign: "center",
    color: palette.wine,
    backgroundColor: palette.salmon,
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerP: {
    color: "#334155",
    marginTop: 5,
  },
  registerLink: {
    color: palette.wine,
    fontWeight: "bold",
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
});
