// Set your actual Railway URL in the .env file as VITE_API_URL 
// Or replace the fallback string with your direct Railway backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "https://your-backend-app.up.railway.app";
export default BASE_URL;
