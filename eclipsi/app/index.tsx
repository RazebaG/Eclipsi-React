import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CadastroScreen({ navigation }) {
  // Equivalente às funções makeLogin e makeRegister do script.js
  const handleLogin = () => {
    // Exemplo com React Navigation: navigation.navigate('Login');
    console.log("Navegar para a tela de login");
  };

  const handleRegister = () => {
    // Exemplo com React Navigation: navigation.navigate('Cadastro');
    console.log("Navegar para a tela de cadastro");
  };

  return (
    <View style={styles.screenContainer}>
      {/* Fundo superior (cor clara) */}
      <View style={styles.backgroundTop} />

      {/* Fundo inferior com a cor escura */}
      <View style={styles.backgroundBottom} />

      <View style={styles.container}>
        {/* Bloco do Logotipo e Título */}
        <View style={styles.logoTitle}>
          <Image
            source={require("../../assets/images/logo.png")} // Ajuste o caminho conforme sua estrutura
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Cadastro</Text>
        </View>

        {/* Opções de Acesso */}
        <View style={styles.registerOption}>
          <TouchableOpacity
            style={styles.optionRegister}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Fazer login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRegister}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Fazer um cadastro</Text>
          </TouchableOpacity>

          <Text style={styles.registerP}>
            Ja fez um cadastro?{" "}
            <Text style={styles.registerLink} onPress={handleLogin}>
              Clique aqui!
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
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
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    zIndex: 1,
  },
  container: {
    position: "relative",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "90%",
    maxWidth: 500,
    gap: 25,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 250,
    maxHeight: 250,
    borderRadius: 125,
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
  },
  registerOption: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 25,
    width: "100%",
  },
  optionRegister: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1d0027",
  },
  registerP: {
    color: "#ffffff",
    fontSize: 14,
  },
  registerLink: {
    color: "#00ffea",
    textDecorationLine: "underline",
  },
});
