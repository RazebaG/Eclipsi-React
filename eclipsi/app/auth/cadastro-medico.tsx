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

export default function CadastroMedicoScreen({ navigation }) {
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

  // Lógica de envio do formulário adaptada do api.js
  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const payload = {
      nome: name,
      email: email,
      telefone: phone,
      especialidade: specialty,
      registro: councilNumber,
      uf: councilUf,
      descricao: description,
      senha: password,
    };

    try {
      const response = await fetch(
        "https://seu-backend.com/api/register/doctor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      Alert.alert("Aviso", data.message || "Cadastro realizado com sucesso!");

      if (response.ok) {
        // Exemplo de navegação para a tela de login (se estiver usando React Navigation)
        if (navigation && navigation.navigate) {
          navigation.navigate("Login");
        }
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro", "Ocorreu um erro ao conectar ao servidor.");
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Fundos decorativos */}
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Cabeçalho / Logo */}
          <View style={styles.logoTitle}>
            <Image
              source={require("../assets/images/logo.png")} // Ajuste o caminho da imagem conforme seu projeto
              style={styles.logo}
              resizeMode="contain"
            />
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
                <TextInput
                  style={styles.registerInput}
                  placeholder="Nome Completo"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* E-mail Profissional */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="E-mail profissional"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Telefone / WhatsApp */}
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

              {/* Especialidade / Profissão (Simulado com TextInput ou Picker) */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Especialidade (Ex: Psiquiatra, Psicólogo)"
                  placeholderTextColor="#888"
                  value={specialty}
                  onChangeText={setSpecialty}
                />
              </View>

              {/* Grupo para Conselho e UF */}
              <View style={styles.formRow}>
                <View style={[styles.sentenceLine, { flex: 2 }]}>
                  <TextInput
                    style={styles.registerInput}
                    placeholder="Nº do Registro (CRM / CRP)"
                    placeholderTextColor="#888"
                    value={councilNumber}
                    onChangeText={setCouncilNumber}
                  />
                </View>
                <View
                  style={[
                    styles.sentenceLine,
                    styles.sentenceLineSm,
                    { flex: 1 },
                  ]}
                >
                  <TextInput
                    style={styles.registerInput}
                    placeholder="UF"
                    placeholderTextColor="#888"
                    autoCapitalize="characters"
                    maxLength={2}
                    value={councilUf}
                    onChangeText={setCouncilUf}
                  />
                </View>
              </View>

              {/* Descrição / Forma de trabalhar */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={[styles.registerInput, styles.textArea]}
                  placeholder="Apresentação / Forma de trabalhar (opcional)"
                  placeholderTextColor="#888"
                  multiline={true}
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Senha */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Crie uma senha"
                  placeholderTextColor="#888"
                  secureTextEntry={true}
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
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Botões e Link de Login */}
              <View style={styles.btnLine}>
                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={handleSubmit}
                >
                  <Text style={styles.registerBtnText}>
                    Cadastrar Profissional
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => {
                    if (navigation && navigation.goBack) {
                      navigation.goBack();
                    }
                  }}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>

                <View style={styles.loginLinkContainer}>
                  <Text style={styles.registerP}>Já possui conta? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (navigation && navigation.navigate) {
                        navigation.navigate("Login");
                      }
                    }}
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

const styles = StyleSheet.create({
  screenContainer: {
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
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    zIndex: 2,
  },
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    maxWidth: 500,
    gap: 20,
    borderRadius: 15,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#d196eb",
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
    gap: 18,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
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
  registerInput: {
    padding: 12,
    width: "100%",
    borderRadius: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#ffffff",
    backgroundColor: "#ffffff",
    color: "#333333",
    fontSize: 14,
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
  loginLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  registerP: {
    color: "#ffffff",
    fontSize: 14,
  },
  registerLink: {
    color: "#00ffea",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
