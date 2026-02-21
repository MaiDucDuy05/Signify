import { createContext, useContext, useState, useEffect } from "react";
import { saveAuthToken, getAuthToken, removeAuthToken } from "../utils/authToken.js";
import { logout as logoutAPI } from "../utils/api.js";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            try {
                setUser(token);
            } catch (error) {
                console.error("Invalid token:", error);
                removeAuthToken();
                setUser(null);
            }
        }
    }, []);

    const login = (userData) => {
        saveAuthToken(userData);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error("Logout API error:", error);
        }
        removeAuthToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
