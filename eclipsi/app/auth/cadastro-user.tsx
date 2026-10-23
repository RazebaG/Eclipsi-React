import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CadastroScreen({ navigation }) {
  // Estados para capturar os dados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Lógica de submissão baseada no seu script.js / api.js
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const payload = {
      nome: name,
      email: email,
      telefone: phone,
      idade: age ? Number(age) : null,
      genero: gender,
      senha: password,
    };

    try {
      const response = await fetch(
        "https://seu-backend.com/api/register/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      Alert.alert("Aviso", data.message || "Cadastro realizado com sucesso!");

      if (response.ok) {
        // Redireciona para a tela de login usando o React Navigation
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro", "Ocorreu um erro ao conectar ao servidor.");
    }
  };

  return (
    <View style={styles.containerMain}>
      {/* Fundos decorativos */}
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Logo e Título */}
          <View style={styles.logoTitle}>
            <Image
              source={require("../../assets/images/logo.png")} // Ajuste o caminho do seu ativo local
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Cadastro</Text>
          </View>

          {/* Formulário */}
          <View style={styles.register}>
            <View style={styles.registerForm}>
              {/* Nome */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque seu nome"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* E-mail */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque seu email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Telefone */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Telefone / WhatsApp (DD + número)"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Idade e Gênero (Lado a lado) */}
              <View style={styles.formRow}>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  <TextInput
                    style={styles.registerInput}
                    placeholder="Idade"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={3}
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  {/* Nota: No React Native, selects costumam usar bibliotecas como @react-native-picker/picker */}
                  <TextInput
                    style={styles.registerInput}
                    placeholder="Gênero"
                    placeholderTextColor="#888"
                    value={gender}
                    onChangeText={setGender}
                  />
                </View>
              </View>

              {/* Senha */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque sua senha"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Confirmação de Senha */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Botões e Links */}
              <View style={styles.btnLine}>
                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={handleRegister}
                >
                  <Text style={styles.registerBtnText}>Cadastrar-se!</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>

                <Text style={styles.registerP}>
                  Já fez um cadastro?{" "}
                  <Text
                    style={styles.registerLink}
                    onPress={() => navigation.navigate("Login")}
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

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    backgroundColor: "#322c8e",
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
    height: "80%",
    backgroundColor: "#322c8e",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    zIndex: 2,
  },
  container: {
    position: "relative",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "90%",
    maxWidth: 500,
    gap: 20,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  title: {
    color: "white",
    fontSize: 28,
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
    gap: 18,
    width: "100%",
  },
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
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
    gap: 12,
    width: "100%",
    marginTop: 10,
  },
  registerInput: {
    padding: 12,
    width: "100%",
    borderRadius: 15,
    borderBottomWidth: 2,
    borderBottomColor: "white",
    backgroundColor: "white",
    color: "#333",
    fontSize: 14,
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderBottomWidth: 5,
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
  },
  registerBtnText: {
    color: "#1d0027",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
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
  registerP: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  registerLink: {
    color: "rgb(0, 255, 234)",
    textDecorationLine: "underline",
  },
});
