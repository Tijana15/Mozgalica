import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { registerUser } from "../utils/database";
import { useTranslation } from "react-i18next"; // 1. Import hook-a

const RegistrationScreen = ({ navigation }) => {
  const { t } = useTranslation(); // 2. Poziv hook-a
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert(t("errorTitle"), t("allFieldsRequired"));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t("errorTitle"), t("passwordsDoNotMatch"));
      return;
    }

    try {
      const success = await registerUser(username, password);
      if (success) {
        Alert.alert(t("successTitle"), t("registrationSuccessMessage"));
        navigation.navigate("Login");
      } else {
        Alert.alert(t("errorTitle"), t("registrationFailedMessage"));
      }
    } catch (error) {
      Alert.alert(
        t("errorTitle"),
        error.message || t("registrationGenericError")
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 3. Korišćenje prevoda */}
      <Text style={styles.title}>{t("registerTitle")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("usernamePlaceholder")}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder={t("confirmPasswordPlaceholder")}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>{t("registerButton")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>
          {t("alreadyHaveAccount")} <Text style={styles.linkTextBold}>{t("signin")}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#013a20",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#478c5c",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#013a20",
    marginTop: 10,
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
});

export default RegistrationScreen;
