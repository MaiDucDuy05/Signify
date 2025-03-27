import { registerUser, loginUser, generateToken } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const {name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUser(email, password);

        res.json({ message: "Login successful", user, token });
    } catch (err) {
        res.status(401).json({ error: err.message }); 
    }
};
