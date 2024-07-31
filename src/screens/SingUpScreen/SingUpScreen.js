import React, { useState } from 'react';
import { View, Text, TextInput,/*  Button, */ StyleSheet, ImageBackground, Image, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { API_URLS } from "../../config/apiConfig";
import InputCodigo from '../../component/InputCodigo'; // Asegúrate de ajustar la ruta de importación según tu estructura de archivos
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from './SingUpScreen.style';
import { Button } from 'react-native-paper';
export function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isEmailValidated, setIsEmailValidated] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [securePassword, setSecurePassword] = useState(true); // Estado para controlar la visibilidad de la contraseña
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true); // Estado para controlar la visibilidad de la confirmación de la contraseña

    const handleClose = () => {
        setModalVisible(false);
    };

    const handleSignUp = async () => {
        // Validar formato de email
        if (!validateEmailFormat(email)) {
            setEmailError('Ingrese un correo electrónico válido');
            return;
        }

        // Validar existencia de email
        const emailIsValid = await validateEmail(email);
        if (!emailIsValid) {
            return;
        }

        // Validar fortaleza de contraseña
        if (!validatePassword(password)) {
            setEmailError('La contraseña debe tener al menos 7 caracteres incluyendo mayúsculas, minúsculas, números y caracteres especiales');
            return;
        }

        // Verificar coincidencia de contraseñas
        if (password !== confirmPassword) {
            setEmailError('Las contraseñas no coinciden');
            return;
        }

        // Mostrar el modal para ingresar el código
        enviarEmail(email);
        setModalVisible(true);
    };

    const validateEmail = async (email) => {
        try {
            const response = await axios.get(API_URLS.getValEmailExist(email));
            if (response.data.exist) {
                setEmailError('El correo electrónico ya existe');
                setIsEmailValidated(false);
                return false;
            } else {
                setEmailError('');
                setIsEmailValidated(true);
                return true;
            }
        } catch (error) {
            setEmailError('Hubo un error validando el correo electrónico');
            setIsEmailValidated(false);
            return false;
        }
    };

    const enviarEmail = async (email) => {
        try {
            const response = await axios.post(API_URLS.postEnviarCodigo, { email });
            if (response.status === 200) {
                console.log("Código de validación enviado correctamente.");
                // Aquí puedes agregar cualquier lógica adicional que necesites cuando el envío sea exitoso
            } else {
                console.error("Error al enviar el código de validación:", response.data);
                return;
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            return;
        }
    };

    const validateEmailFormat = (email) => {
        // Expresión regular para validar formato básico de email
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        // Expresión regular para asegurar la complejidad de la contraseña (mínimo 7 caracteres incluyendo mayúsculas, minúsculas, números y caracteres especiales)
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
        return regex.test(password);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        navigation.navigate('Login'); // Regresar a la pantalla de Login después de cerrar el modal
    };

    const toggleSecureEntry = (field) => {
        if (field === 'password') {
            setSecurePassword(!securePassword); // Alternar visibilidad de la contraseña
        } else if (field === 'confirmPassword') {
            setSecureConfirmPassword(!secureConfirmPassword); // Alternar visibilidad de la confirmación de la contraseña
        }
    };

    return (
        <ImageBackground
            source={require('../../../assets/montana.jpg')} // Reemplaza con tu imagen de fondo
            style={styles.background}
        >
            <View style={styles.container}>
                <Image
                    source={require('../../../assets/userRegister.png')}  // Reemplaza con tu imagen de logo
                    style={styles.logo}
                />
                <Text style={styles.title}>Register with your credentials</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setIsEmailValidated(false); // Reiniciar validación al cambiar el email
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                {!isEmailValidated && < Button icon="account-plus" mode="contained" title="Validate Email" onPress={() => {
                    if (validateEmailFormat(email)) {
                        validateEmail(email);
                    } else {
                        setEmailError('Ingrese un correo electrónico válido');
                    }
                }}  >Validate email</Button>}
                {isEmailValidated && (
                    <>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.inputPassword}
                                placeholder="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={securePassword} // Estado que controla la visibilidad de la contraseña
                            />
                            <TouchableOpacity style={styles.toggleButton} onPress={() => toggleSecureEntry('password')}>
                                <Icon name={securePassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.inputPassword}
                                placeholder="Confirmar Contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={secureConfirmPassword} // Estado que controla la visibilidad de la confirmación de la contraseña
                            />
                            <TouchableOpacity style={styles.toggleButton} onPress={() => toggleSecureEntry('confirmPassword')}>
                                <Icon name={secureConfirmPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
                            </TouchableOpacity>
                        </View>


                        <Button title="Registrarse" onPress={handleSignUp} />
                        <Button icon="account-plus" mode="contained"  onPress={handleSignUp} >Register</Button>
                    </>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>¿Do you already have an account? Log in</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleClose}
            >
                <View style={styles.modalView}>
                    <InputCodigo onClose={handleModalClose} navigation={navigation} email={email} password={password} />
                </View>
            </Modal>
        </ImageBackground>
    );
}