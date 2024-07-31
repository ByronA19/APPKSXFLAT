import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Text, Surface, useTheme } from "react-native-paper";
import { screen } from "../utils";

export function MenuUser() {
  const navigation = useNavigation();
  const [iUser, setIUser] = useState(0);
  const [storedUserId, setStoredUserId] = useState("");
  const [storedUserType, setStoredUserType] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const userType = await AsyncStorage.getItem("rol");
        setStoredUserId(userId);
        setStoredUserType(userType);

        if (userType === "Admin") {
          setIUser(1);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error.message);
      }
    };

    fetchUserId();
  }, [navigation]);

  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Surface style={styles.surface}>
          <Button
            mode="contained"
            icon={() => <FontAwesome name="list-alt" size={24} color="white" />}
            onPress={() => navigation.navigate(screen.user.accounts, { type: "edit", userId: storedUserId })}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Update
          </Button>
        </Surface>
        {iUser === 1 && (
          <Surface style={styles.surface}>
            <Button
              mode="contained"
              icon={() => <FontAwesome name="list" size={24} color="white" />}
              onPress={() => navigation.navigate(screen.user.userlist)}
              style={styles.button}
              labelStyle={styles.buttonText}
            >
              Usuarios
            </Button>
          </Surface>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
  },
  surface: {
    marginHorizontal: 10,
    borderRadius: 30,
    elevation: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});