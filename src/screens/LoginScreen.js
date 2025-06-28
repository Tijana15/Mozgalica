import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { checkUserCredentials } from "../utils/database";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Greška", "Unesite korisničko ime i lozinku.");
      return;
    }

    try {
      const isValid = await checkUserCredentials(username, password);
      if (isValid) {
        navigation.navigate("Home", { username });
      } else {
        Alert.alert("Greška", "Netačno korisničko ime ili lozinka.");
      }
    } catch (error) {
      Alert.alert(
        "Greška",
        "Došlo je do greške prilikom prijave: " + error.message
      );
      console.error("Greška pri prijavi:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prijava</Text>
      <TextInput
        style={styles.input}
        placeholder="Korisničko ime"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Prijavi se</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText1}>
          Nemate nalog? <Text style={styles.linkText}>Registrujte se</Text>
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
    backgroundColor: "#f5f5f4",
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
    textDecorationLine: "underline",
  },
  linkText1: {
    color: "#013a20",
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoginScreen;
