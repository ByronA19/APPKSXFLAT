import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const API_BASE_URL = "http://192.168.1.4:3000/api/v1"; // Usa tu IP local en lugar de localhost
//const API_BASE_URL = "http://172.16.30.159:3000/api/v1";
export const API_URLS = {
  getValEmailExist: (email) => `${API_BASE_URL}/auth/validateExistEmail/${email}`,
  postEnviarCodigo: `${API_BASE_URL}/email`,
  getValCodigo: (email, codigo) => `${API_BASE_URL}/email/${email}/${codigo}`,
  postSignUp: `${API_BASE_URL}/users/signup`,
  postSignIn: `${API_BASE_URL}/auth/signin`,
  postCreateFlat: `${API_BASE_URL}/flats`,
  getfindFullFlatById: (id) => `${API_BASE_URL}/flats/${id}`,
  getFlats: `${API_BASE_URL}/flats`,
  putUpdateFlats: (id)=> `${API_BASE_URL}/flats/${id}`,
  postFavoriteFlats: `${API_BASE_URL}/favoriteFlats`,
  getFavoriteFlats: (idFlats, idUsuario) => `${API_BASE_URL}/favoriteFlats/${idFlats}/${idUsuario}`,
  getTodosFlats: `${API_BASE_URL}/flats`,
  getFavoriteFlatsTodos: (idUsuario) => `${API_BASE_URL}/favoriteFlats/${idUsuario}`,
  putMessage: `${API_BASE_URL}/messages`,
  getFindUserID: (id) => `${API_BASE_URL}/users/${id}`,
  postCrearUsuario:(id) => `${API_BASE_URL}/users/${id}`,
  getAllProvincia: `${API_BASE_URL}/provincias`,
  getAllCanton: (idProvincia) => `${API_BASE_URL}/cantones/${idProvincia}`,
  searchFlatsBySort: (sortBy) => `${API_BASE_URL}/searchFlats?sortBy=${sortBy}`,
  listUser: `${API_BASE_URL}/users`,
  getCountFlats: `${API_BASE_URL}/flats/counters/user`,
  getMEssage: (id) =>`${API_BASE_URL}/messages/flat/${id}`,
  getMessageLista: (id,idFlat) => `${API_BASE_URL}/messages/user/${id}/flat/${idFlat}`,
  getMessagesByParams: (idUsuarioRecibe, idUsuarioEnvia, idflat) => `${API_BASE_URL}/messages/message/${idUsuarioRecibe}/${idUsuarioEnvia}/${idflat}`,

 
  
};

//renders-landors-