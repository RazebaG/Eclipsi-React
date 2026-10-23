import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CadastroScreen({ navigation }) {
  // Funções de navegação equivalentes às do script.js original
  const handleMedChange = () => {
    // Exemplo usando navegação React Navigation: navigation.navigate('CadastroMedico')
    console.log("Navegar para cadastro de médico");
  };

  const handlePacChange = () => {
    // navigation.navigate('CadastroPaciente')
    console.log("Navegar para cadastro de paciente");
  };

  const handleGoBack = () => {
    // navigation.goBack() ou navigation.navigate('Home')
    console.log("Voltar");
  };

  const handleLoginRedirect = () => {
    // navigation.navigate('Login')
    console.log("Ir para o login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fundo superior (cor clara) */}
      <View style={styles.backgroundTop} />

      {/* Fundo inferior com a curva (cor escura) */}
      <View style={styles.backgroundBottom} />

      <View style={styles.container}>
        <View style={styles.logoTitleContainer}>
          <Image
            source={require("../../assets/images/logo.png")} // Ajuste o caminho da imagem conforme seu projeto
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Cadastro</Text>
        </View>

        <View style={styles.registerOption}>
          <TouchableOpacity
            style={styles.optionRegister}
            onPress={handleMedChange}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Cadastrar-se como médico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRegister}
            onPress={handlePacChange}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Cadastrar-se como paciente</Text>
          </TouchableOpacity>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#322c8e",
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "#ffeec2",
    zIndex: 1,
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#322c8e",
    borderTopLeftRadius: width * 0.5,
    borderTopRightRadius: width * 0.5,
    zIndex: 1,
  },
  container: {
    position: "relative",
    zIndex: 2,
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
    width: 250,
    height: 250,
    borderRadius: 125,
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
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
  },
  btnText: {
    color: "#1d0027",
    fontWeight: "600",
    fontSize: 16,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderBottomWidth: 5,
    borderBottomColor: "#4a4a4a",
    borderRadius: 15,
    backgroundColor: "#a8a8a8",
  },
  backBtnText: {
    color: "#1d0027",
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
    color: "rgb(0, 255, 234)",
    fontWeight: "bold",
    fontSize: 14,
  },
});
