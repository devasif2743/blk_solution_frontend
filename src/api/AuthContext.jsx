import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 AuthContext initializing...");

    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_details");

    console.log("🪣 LocalStorage token:", token);
    console.log("🧾 LocalStorage user_details:", userData);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("✅ Restored user from localStorage:", parsedUser);
      } catch (e) {
        console.error("❌ Error parsing stored user JSON:", e);
      }
    } else {
      console.warn("⚠️ No user found in localStorage");
    }

    setIsLoading(false);
  }, []);

   const logout = () => {
    console.log("🚪 Logging out user...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_details");
    setUser(null);
    // redirect to login
    window.location.href = "/login";
  };

  useEffect(() => {
    console.log("👤 Auth state changed:", { user, isLoading });
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading,logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
