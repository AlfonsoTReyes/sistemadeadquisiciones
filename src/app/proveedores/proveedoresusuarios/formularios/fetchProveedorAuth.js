const API_BASE_URL = "/api/proveedorusuario";

/** Performs login for a provider user */
export const loginProveedor = async (credentials) => {
    const { usuario, contraseña } = credentials;
    try {
      // Fetch call targets the '/login' sub-path
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contraseña }),
      });
  
      const data = await response.json(); // Always parse JSON to get potential error messages
  
      if (!response.ok) {
        // Throw error using the message from the API response if available
        throw new Error(data.message || `Error ${response.status}: Falló el inicio de sesión`);
      }
  
      return data; // Contains token and user info on success
    } catch (err) {
      console.error("Error during provider login fetch:", err);
      // Re-throw the error message to be caught by the component/hook
      throw new Error(err.message);
    }
  };

  /** Registers a new provider user */
export const signupProveedor = async (userData) => {
    const { usuario, nombre, apellidoPaterno, apellidoMaterno, correo, contraseña } = userData;
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the correct fields in the body
        body: JSON.stringify({ usuario, nombre, apellidoPaterno, apellidoMaterno, correo, contraseña }),
      });
 
      const data = await response.json();
 
      if (!response.ok) {
         throw new Error(data.message || `Error ${response.status}: Falló el registro`);
      }
 
      return data;
    } catch (err) {
       console.error("Error during provider signup fetch:", err);
      throw new Error(err.message);
    }
 };