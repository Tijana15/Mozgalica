import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next"; // 1. Import hook-a

const SettingsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation(); // 2. Poziv hook-a
  const { username } = route.params || {};

  const languages = [
    { code: "sr", name: "Srpski", flag: "🇷🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  // Nema više potrebe za lokalnim stanjem jezika, i18n to rešava.

  const saveLanguage = async (languageCode) => {
    try {
      await AsyncStorage.setItem("selectedLanguage", languageCode);
      i18n.changeLanguage(languageCode); // Ova linija će automatski osvežiti interfejs
      Alert.alert(t("successTitle"), t("languageChangedSuccess"), [
        { text: "OK" },
      ]);
    } catch (error) {
      console.log("Greška pri čuvanju jezika:", error);
      Alert.alert(t("errorTitle"), t("saveSettingsError"));
    }
  };

  const handleLanguagePress = (languageCode) => {
    saveLanguage(languageCode);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("settingsTitle")}</Text>
        <Text style={styles.username}>
          {t("player")} {username}
        </Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 {t("appLanguage")}</Text>

          <View style={styles.languageContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageCard,
                  // Proveravamo direktno trenutni jezik iz i18n instance
                  i18n.language === language.code && styles.selectedLanguage,
                ]}
                onPress={() => handleLanguagePress(language.code)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    i18n.language === language.code &&
                      styles.selectedLanguageText,
                  ]}
                >
                  {language.name}
                </Text>
                {i18n.language === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ {t("info")}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t("appVersion")} 1.0.0</Text>
            <Text style={styles.infoText}>{t("lastUpdate")} Jun 2025</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: "#666",
  },
  settingsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  languageContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedLanguage: {
    backgroundColor: "#e6f3ff",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  selectedLanguageText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  checkmark: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SettingsScreen;
