import { createContext, useContext, useState, useEffect } from "react";
import { saveAuthToken, getAuthToken, removeAuthToken } from "../utils/authToken";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        setUser(JSON.parse(token) ); // Lấy thông tin user từ token trong cookies
    }, []);

    const login = (userData) => {
        saveAuthToken(userData); // Lưu token vào cookies
        setUser(JSON.parse(userData)); // Cập nhật state ngay lập tức
    };

    const logout = () => {
        removeAuthToken(); // Xóa token khỏi cookies
        setUser(null); // Cập nhật state ngay lập tức

    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
