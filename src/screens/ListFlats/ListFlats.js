import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  ImageBackground,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import * as Animatable from "react-native-animatable";
import { Card, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { screen } from "../../utils";
import { API_URLS } from "../../config/apiConfig";
import CustomModalWithLocation from "../../component/CustomModalWithLocation";
import MessageCardModal from "../../component/MessageCardModal";

export function ListFlats({ route }) {
  const { type, userId } = route.params;

  const navigation = useNavigation();
  const [flatsData, setFlatsData] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const [userIdSet, setUserId] = useState("");
  const [modalVisibleLocation, setModalVisibleLocation] = useState(false);
  const [modalVisibleMessage, setModalVisibleMessage] = useState(false);
  const [modalData, setModalData] = useState({
    latitude: null,
    longitude: null,
    city: "",
    streetName: "",
    avatar: "",
    email: "",
    streetNumber: "",
    flatId: "",
    userId: "",
    storedUserId: "",
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId !== null) {
          setUserId(storedUserId);
        } else {
          console.log("No se encontró userId almacenado en AsyncStorage.");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error.message);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchFlatsData = async () => {
      try {
        let Url = API_URLS.getTodosFlats;
        if (type === "favo") {
          Url = API_URLS.getFavoriteFlatsTodos(userId);
        }
        const response = await axios.get(Url, { timeout: 5000 });
        setFlatsData(response.data);

        const initialFavorites = {};
        response.data.forEach((item) => {
          initialFavorites[item._id] = false;
        });
        setFavorites(initialFavorites);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching flats data:", error.message);
        setLoading(false);
      }
    };

    fetchFlatsData();
  }, [type, userId]);

  useEffect(() => {
    const getFavoriteStatus = async (flatId, userIdSet) => {
      try {
        const response = await axios.get(
          API_URLS.getFavoriteFlats(flatId, userIdSet)
        );

        if (response.data.search === "ok") {
          setFavorites((prevFavorites) => ({
            ...prevFavorites,
            [flatId]: true,
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching favorite status for flat ${flatId}:`,
          error.message
        );
      }
    };

    flatsData.forEach((item) => {
      getFavoriteStatus(item._id, userIdSet);
    });
  }, [flatsData, userIdSet]);

  const toggleFavorite = async (idFlats, idUsuario) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [idFlats]: !prevFavorites[idFlats],
    }));

    const estadoFavorito = favorites[idFlats] ? "inactive" : "active";

    try {
      const response = await fetch(API_URLS.postFavoriteFlats, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flat: idFlats,
          user: idUsuario,
          status: estadoFavorito,
        }),
      });

      if (!response.ok) {
        throw new Error("Error adding favorite flat");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error adding favorite flat:", error.message);
    }
  };

  const toggleMaps = async (idFlats, idUsuario, latitude, longitude) => {
    setModalData({
      ...modalData,
      latitude: longitude,
      longitude: latitude,
    });
    setModalVisibleLocation(true);
  };

  const openModal = (
    city,
    streetName,
    avatar,
    email,
    streetNumber,
    flatId,
    userId,
    storedUserId
  ) => {
    setModalData({
      ...modalData,
      city: city,
      streetName: streetName,
      avatar: avatar,
      email: email,
      streetNumber: streetNumber,
      flatId: flatId,
      userId: userId,
      storedUserId: storedUserId,
    });
    setModalVisibleMessage(true);
  };

  const handleCloseModal = () => {
    setModalVisibleLocation(false);
    setModalVisibleMessage(false);
    setModalData({
      latitude: null,
      longitude: null,
      city: "",
      streetName: "",
      avatar: "",
      email: "",
      streetNumber: "",
      flatId: "",
      userId: "",
      storedUserId: "",
    });
  };

  const shareViaWhatsApp = (email, city, streetName, streetNumber) => {
    const message = `Check out this flat in ${city} at ${streetName}, ${streetNumber}! Contact: ${email}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("WhatsApp is not installed");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((error) => console.error("Error opening WhatsApp:", error));
  };

  const renderFlat = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={1000}
      style={styles.flatContainer}
    >
      <Card containerStyle={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.flatName}>{item.streetNumber}</Text>
          {userIdSet === item.user._id && (
            <View style={styles.userIconContainer}>
              <TouchableOpacity
                style={styles.userIcon}
                onPress={() =>
                  navigation.navigate(screen.flat.updateflats, {
                    userId: item._id,
                  })
                }
              >
                <FontAwesome name="edit" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            onPress={() => toggleFavorite(item._id, userIdSet)}
            style={styles.heartIconContainer}
          >
            <FontAwesome
              name={favorites[item._id] ? "heart" : "heart-o"}
              size={24}
              color={favorites[item._id] ? "#F44336" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              toggleMaps(
                item._id,
                userIdSet,
                item.city,
                item.canton
              )
            }
            style={styles.mapIconContainer}
          >
            <FontAwesome name="map-marker" size={24} color="#FF5722" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              shareViaWhatsApp(
                item.user.email,
                item.city,
                item.streetName,
                item.streetNumber
              )
            }
            style={styles.whatsappIconContainer}
          >
            <FontAwesome name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>
        <Card.Divider />
        <Text style={styles.flatDescription}>
          Street: {item.streetName}, {item.streetNumber}
        </Text>
        <Text style={styles.flatDescription}>
          Rent Price: ${item.rentPrice}
        </Text>
        <Text style={styles.flatDescription}>
          Area Size: {item.areaSize} sq ft
        </Text>
        <Text style={styles.flatDescription}>Year Built: {item.yearBuilt}</Text>
        <Text style={styles.flatDescription}>
          Available: {new Date(item.dateAvailable).toDateString()}
        </Text>
        <Text style={styles.flatDescription}>
          User Email: {item.user.email}
        </Text>

        <View style={styles.iconContainer}>
          <Icon
            name="snowflake-o"
            type="font-awesome"
            color={item.hasAc ? "#2196F3" : "#9E9E9E"}
          />
          <Text style={styles.iconText}>{item.hasAc ? "Has AC" : "No AC"}</Text>
        </View>

        {userIdSet !== item.user._id && (
          <View style={styles.userIconContainer}>
            <TouchableOpacity
              style={styles.userIcon}
              onPress={() =>
                openModal(
                  item.city,
                  item.streetName,
                  item.user.avatar,
                  item.user.email,
                  item.streetNumber,
                  item._id,
                  item.user._id,
                  userIdSet
                )
              }
            >
              <FontAwesome name="envelope" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const filteredFlats =
    type === "favo"
      ? flatsData.filter((item) => favorites[item._id])
      : flatsData;

  return (
    <ImageBackground
      source={{ uri: 'https://c.wallhere.com/photos/c2/7d/AI_art_illustration_mountains_vector_art_blue_orange-2223190.jpg!d' }} // Reemplaza con la URL de tu imagen
      style={styles.container}
      resizeMode="cover" // Ajusta el tamaño de la imagen para cubrir el fondo
    >
      <FlatList
        data={filteredFlats}
        renderItem={renderFlat}
        keyExtractor={(item) => item._id}
      />

      {modalVisibleLocation && (
        <CustomModalWithLocation
          visible={modalVisibleLocation}
          onClose={handleCloseModal}
          latitude={modalData.latitude}
          longitude={modalData.longitude}
        />
      )}

      {modalVisibleMessage && (
        <MessageCardModal
          visible={modalVisibleMessage}
          message={`${modalData.email}!`}
          avatar={modalData.avatar}
          city={modalData.city}
          streetName={modalData.streetName}
          streetNumber={modalData.streetNumber}
          flatId={modalData.flatId}
          userId={modalData.userId}
          storedUserId={modalData.storedUserId}
          onClose={handleCloseModal}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  flatContainer: {
    marginBottom: 15,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 5,
    padding: 15,
    borderColor: '#FF5722',
    borderWidth: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  flatName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  heartIconContainer: {
    marginHorizontal: 8,
  },
  mapIconContainer: {
    marginHorizontal: 8,
  },
  whatsappIconContainer: {
    marginHorizontal: 8,
  },
  userIconContainer: {
    marginHorizontal: 8,
  },
  userIcon: {
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    padding: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  iconText: {
    marginLeft: 8,
    color: '#555',
  },
  flatDescription: {
    fontSize: 16,
    color: '#444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
