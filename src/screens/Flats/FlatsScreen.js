import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URLS } from "../../config/apiConfig";
import { styles } from "./FlatsScreen.style";
import Theme from "../../component/themes";
import CustomModal from "../../component/Modal";

export function FlatsScreen({ route }) {
  const { userId } = route.params;
  const [showModal, setShowModal] = useState(false);

  const [flats, setFlats] = useState({
    city: "",
    canton: "",
    streetName: "",
    streetNumber: "",
    areaSize: "",
    hasAc: false,
    yearBuilt: "",
    rentPrice: "",
    dateAvailable: new Date().toISOString().slice(0, 10),
    user: userId || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  // Función para manejar la selección de ubicación desde el modal
  const handleLocationSelect = (location) => {
    setFlats({
      ...flats,
      canton: location.latitude.toString(), // Puedes cambiar esto según la estructura de tu objeto flats
      city: location.longitude.toString(),
      streetName: location.address,
    });
    toggleModal(); // Cerrar el modal después de seleccionar la ubicación
  };

  // Función para obtener el ID del usuario almacenado o del parámetro de ruta
  const fetchUserId = async () => {
    try {
      if (!userId) {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setFlats((prevFlats) => ({ ...prevFlats, user: storedUserId }));
        }
      }

      if (route.params.type === "update") {
        setIsUpdate(true);
        fetchFlatDetails(flats.user);
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  // Función para obtener los detalles del apartamento para actualizar
  const fetchFlatDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.getfindFullFlatById(id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error fetching flat details");
      }
      const data = await response.json();
      setFlats({
        city: data.city || "",
        canton: data.canton || "",
        streetName: data.streetName || "",
        streetNumber: data.streetNumber || "",
        areaSize: data.areaSize || "",
        hasAc: data.hasAc || false,
        yearBuilt: data.yearBuilt || "",
        rentPrice: data.rentPrice || "",
        dateAvailable: data.dateAvailable
          ? new Date(data.dateAvailable).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        user: data.user || flats.user,
      });
      setError("");
    } catch (error) {
      console.error("Error fetching flat details:", error);
      setError("Error fetching flat details");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la presentación del formulario
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const requiredFields = [
        { value: flats.city, label: "City" },
        { value: flats.canton, label: "Canton" },
        { value: flats.streetName, label: "Street name" },
        { value: flats.streetNumber, label: "Street number" },
        { value: flats.areaSize, label: "Area size" },
        { value: flats.yearBuilt, label: "Year built" },
        { value: flats.rentPrice, label: "Rent price" },
        { value: flats.dateAvailable, label: "Date available" },
      ];

      const isEmpty = requiredFields.some((field) => field.value.trim() === "");
      if (isEmpty) {
        setError("Complete all required fields");
        setLoading(false);
        return;
      }

      const url = isUpdate
        ? `${API_URLS.putUpdateFlats(userId)}`
        : API_URLS.postCreateFlat;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flats),
      });

      if (!response.ok) {
        const responseData = await response.json();
        setError(responseData.message || "Error submitting the form");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Success",
        `Flat ${isUpdate ? "updated" : "created"} successfully`
      );
      if (!isUpdate) {
        setFlats({
          city: "",
          canton: "",
          streetName: "",
          streetNumber: "",
          areaSize: "",
          hasAc: false,
          yearBuilt: "",
          rentPrice: "",
          dateAvailable: new Date().toISOString().slice(0, 10),
          user: flats.user,
        });
      }
      setError("");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting the form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, [userId, route.params.type]);

  return (
    <ImageBackground 
      source={{ uri: 'https://c.wallhere.com/photos/c2/7d/AI_art_illustration_mountains_vector_art_blue_orange-2223190.jpg!d' }} 
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.largeInputGroup}>
            <Icon
              name="add-road"
              size={24}
              style={styles.icon}
              onPress={toggleModal}
            />
            <TextInput
              style={[styles.input, styles.largeInput]} // Combina estilos para hacer el TextInput más grande
              placeholder="Street name"
              value={flats.streetName}
              onChangeText={(text) => setFlats({ ...flats, streetName: text })}
              editable={false} // Esta línea deshabilita la edición del TextInput
            />
            <Icon
              name="gps-fixed"
              size={24}
              style={[styles.icon, styles.icongps]} // Ajusta el estilo del ícono GPS si es necesario
              onPress={toggleModal}
            />
          </View>

          <CustomModal
            visible={showModal}
            onClose={toggleModal}
            onLocationSelect={handleLocationSelect}
          />

          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Icon name="signpost" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Street number"
                value={flats.streetNumber}
                onChangeText={(text) =>
                  setFlats({ ...flats, streetNumber: text })
                }
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Icon name="fit-screen" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Area size"
                keyboardType="numeric"
                value={flats.areaSize}
                onChangeText={(text) => setFlats({ ...flats, areaSize: text })}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Icon name="date-range" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Year built"
                keyboardType="numeric"
                value={flats.yearBuilt}
                onChangeText={(text) => setFlats({ ...flats, yearBuilt: text })}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Icon name="price-change" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Rent price"
                keyboardType="numeric"
                value={flats.rentPrice}
                onChangeText={(text) => setFlats({ ...flats, rentPrice: text })}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Icon name="event-note" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Date Available"
                value={flats.dateAvailable}
                onChangeText={(text) =>
                  setFlats({ ...flats, dateAvailable: text })
                }
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text>Has AC</Text>
              <Switch
                value={flats.hasAc}
                onValueChange={(value) => setFlats({ ...flats, hasAc: value })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Icon name="location-on" size={24} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={flats.city}
              editable={false} // Esta línea deshabilita la edición del TextInput
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="location-on" size={24} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={flats.canton}
              editable={false} // Esta línea deshabilita la edición del TextInput
            />
          </View>

          <Button title="Submit" onPress={handleSubmit} />

          {loading && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
