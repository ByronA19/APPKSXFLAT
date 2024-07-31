import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
 /*  Button, */
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Asegúrate de importar axios si aún no lo has hecho
import { API_URLS } from "../../config/apiConfig";
import { styles } from "./LoginScreen.style";
import { Button } from 'react-native-paper';
import { color } from "react-native-elements/dist/helpers";

export function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [emailExists, setEmailExists] = useState(false); // Estado para verificar si el correo existe

  const handleLogin = async () => {
    try {
      const response = await fetch(API_URLS.postSignIn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);
      if (response.status === 200) {
        // Guardar el token en el almacenamiento local
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("userId", data.user._id);
        await AsyncStorage.setItem("permission", data.user.permission);
        await AsyncStorage.setItem("rol", data.user.rol);

        // Mostrar mensaje de éxito
        setAlert({ message: "Inicio de sesión exitoso", type: "success" });

        // Redirigir al usuario después de mostrar la alerta por 2 segundos
        setTimeout(() => {
          setAlert(null); // Limpiar alerta
          setIsLoggedIn(true);
          // navigation.navigate('Dashboard'); // Redirigir a la pantalla de Dashboard
        }, 2000);
      } else {
        // Mostrar mensaje de error
        setAlert({ message: "Error al iniciar sesión", type: "error" });
      }
    } catch (error) {
      // Manejo de errores
      setAlert({ message: "Error al iniciar sesión", type: "error" });
      console.error("Error:", error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      // Realizar una solicitud para verificar si el correo electrónico existe
      const response = await axios.get(API_URLS.getValEmailExist(email));

      if (response.data.exist) {
        // El correo electrónico existe, proceder con la lógica para recuperación de contraseña
        console.log("Send password recovery email");
        // Aquí podrías implementar la lógica para enviar un correo de recuperación de contraseña

        // Por ahora, simplemente muestra un mensaje
        setAlert({
          message: "Se ha enviado un correo de recuperación de contraseña.",
          type: "success",
        });
      } else {
        // El correo electrónico no existe en la base de datos
        setEmailError("El correo electrónico no está registrado.");
      }
    } catch (error) {
      // Manejo de errores
      console.error("Error al verificar correo electrónico:", error);
      setAlert({
        message: "Error al verificar correo electrónico.",
        type: "error",
      });
    }
  };

  const handleEmailChange = async (text) => {
    setEmail(text);
    if (text.trim() !== "") {
      try {
        // Verificar si el correo electrónico existe al escribirlo
        const response = await axios.get(API_URLS.getValEmailExist(text));
        setEmailExists(response.data.exist);
      } catch (error) {
        console.error("Error al verificar correo electrónico:", error);
      }
    } else {
      setEmailExists(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/montana.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../../../assets/iconoLogin2.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input }
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
         <Button icon="login" mode="contained"  onPress={handleLogin} >Login</Button>
        {alert && (
          <Text
            style={
              alert.type === "success" ? styles.successText : styles.errorText
            }
          >
            {alert.message }
          </Text>
        )}
       {/*  <Button icon='camara' color={"#8b0a50"} title="Login" onPress={handleLogin} />
        {alert && (
          <Text
            style={
              alert.type === "success" ? styles.successText : styles.errorText
            }
          >
            {alert.message}
          </Text>
        )} */}
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        {emailExists && (
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>
              ¿Forgot your password?
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signUpText}>
            ¿You do not have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
