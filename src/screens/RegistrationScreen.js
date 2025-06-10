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

const RegistrationScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert("Greška", "Sva polja moraju biti popunjena.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Greška", "Lozinke se ne podudaraju.");
      return;
    }

    try {
      const success = await registerUser(username, password);
      if (success) {
        Alert.alert("Uspeh", "Registracija uspešna! Sada se možete prijaviti.");
        navigation.navigate("Login");
      } else {
        Alert.alert("Greška", "Registracija neuspešna. Pokušajte ponovo.");
      }
    } catch (error) {
      Alert.alert(
        "Greška",
        error.message || "Došlo je do greške prilikom registracije."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Potvrdi lozinku"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registruj se</Text>
      </TouchableOpacity>
      {/* Dugme za navigaciju nazad na ekran za prijavu */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Već imate nalog? Prijavite se</Text>
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
    color: "#333",
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
    backgroundColor: "#6200ee",
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
    color: "#6200ee",
    marginTop: 10,
    fontSize: 16,
  },
});

export default RegistrationScreen;
