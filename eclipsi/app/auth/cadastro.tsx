import { Head } from 'expo-router/head';
import { withRouteGuard } from '../../components/RouteGuard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { palette } from '../../lib/palette';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function CadastroEscolhaScreen() {
  const router = useRouter();
  const handleMedChange = () => router.push("/auth/cadastro-medico");
  const handlePacChange = () => router.push("/auth/cadastro-user");
  const handleGoBack = () => router.replace("/");
  const handleLoginRedirect = () => router.push("/auth/login");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fundo superior (cor clara) */}
      <View pointerEvents="none" style={styles.backgroundTop} />

      {/* Fundo inferior com a curva (cor escura) */}
      <View pointerEvents="none" style={styles.backgroundBottom} />

      <View style={styles.container}>
        <View style={styles.logoTitleContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Cadastro</Text>
        </View>

        <View style={styles.registerOption}>
          <PrimaryButton
            style={styles.optionRegister}
            onPress={handleMedChange}
          >
            <Text style={styles.btnText}>Cadastrar-se como médico</Text>
          </PrimaryButton>

          <PrimaryButton
            style={styles.optionRegister}
            onPress={handlePacChange}
          >
            <Text style={styles.btnText}>Cadastrar-se como paciente</Text>
          </PrimaryButton>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.registerP}>Já fez um cadastro? </Text>
            <TouchableOpacity onPress={handleLoginRedirect}>
              <Text style={styles.registerLink}>Clique aqui!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const GuardedScreen = withRouteGuard(CadastroEscolhaScreen);

export default function Route() {
  return (
    <>
      <Head>
        <title>EcliPsi — Escolher tipo de cadastro</title>
      </Head>
      <GuardedScreen />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: palette.indigo,
    alignItems: "center",
    justifyContent: "center",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: 500,
    width: "90%",
    gap: 25,
  },
  logoTitleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  registerOption: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 25,
    width: "100%",
  },
  optionRegister: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 12,
    borderBottomWidth: 5,
    borderBottomColor: palette.wine,
    borderRadius: 15,
    backgroundColor: palette.magenta,
  },
  btnText: {
    color: palette.white,
    fontWeight: "bold",
    fontSize: 19,
    textAlign: "center",
  },
  backBtn: {
    display: "flex",
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
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerP: {
    color: "white",
    fontSize: 14,
  },
  registerLink: {
    color: palette.cream,
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
