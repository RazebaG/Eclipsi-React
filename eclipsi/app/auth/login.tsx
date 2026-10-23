import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen({ navigation }) {
  // Estados para capturar os inputs do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Função auxiliar para validar o formato do e-mail
  const validarEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Lógica de submissão e autenticação adaptada do api.js e script.js
  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!validarEmail(trimmedEmail)) {
      Alert.alert("Atenção", "Por favor, insira um e-mail válido.");
      return;
    }

    if (!password) {
      Alert.alert("Atenção", "Por favor, digite sua senha.");
      return;
    }

    const payload = {
      email: trimmedEmail,
      senha: password,
    };

    try {
      // Substitua pela URL real do seu backend
      const response = await fetch("https://seu-servidor.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // No React Native, você pode salvar os dados do usuário usando AsyncStorage ou Context API
        // Exemplo: AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert("Sucesso", "Login realizado com sucesso!");

        // Redirecionamento usando React Navigation (exemplo)
        // navigation.replace('Dashboard');
      } else {
        Alert.alert("Erro", data.message || "E-mail ou senha incorretos.");
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      Alert.alert("Erro", "Ocorreu um erro ao conectar ao servidor.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fundo superior (cor clara) */}
      <View style={styles.backgroundTop} />

      {/* Fundo inferior com curva (cor escura) */}
      <View style={styles.backgroundBottom} />

      <View style={styles.container}>
        {/* Cabeçalho com Logo e Título */}
        <View style={styles.logoTitle}>
          <Image
            source={require("../../assets/images/logo.png")} // Ajuste o caminho conforme sua estrutura de assets
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Login</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.register}>
          <View style={styles.registerForm}>
            <View style={styles.sentenceLine}>
              <TextInput
                style={styles.registerInput}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.sentenceLine}>
              <TextInput
                style={styles.registerInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.btnLine}>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleLogin}
              >
                <Text style={styles.btnTextBold}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>

              <Text style={styles.registerP}>
                Ainda não tem conta?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => navigation.navigate("Register")}
                >
                  Cadastre-se
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
    borderTopLeftRadius: 150, // Adaptação nativa da curva CSS
    borderTopRightRadius: 150,
    zIndex: 1,
  },
  container: {
    position: "relative",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: 500,
    width: "90%",
    gap: 25,
    borderRadius: 15,
  },
  logoTitle: {
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
  register: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  registerForm: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 25,
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
  registerInput: {
    padding: 12,
    width: "100%",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: "white",
    borderRadius: 15,
    backgroundColor: "white",
    fontSize: 16,
    color: "#333",
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 0,
    borderBottomWidth: 5,
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
    width: "100%",
  },
  btnTextBold: {
    fontWeight: "bold",
    color: "#1d0027",
    fontSize: 16,
  },
  registerP: {
    color: "white",
    marginTop: 5,
  },
  registerLink: {
    color: "rgb(0, 255, 234)",
    fontWeight: "bold",
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderWidth: 0,
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
});
