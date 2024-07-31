import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // 'cover' para cubrir toda la pantalla
    justifyContent: 'center', // Alineación vertical centrada
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco con opacidad del 80%
    borderRadius: 8,
    padding: 16,
  },
  error: {
    color: 'red',
  },
  largeInputGroup: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  largeInput: {
    flex: 1,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
