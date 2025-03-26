import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.js";
import API from "../../utils/api"; 


const cx = classNames.bind(styles);

function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      login(user);
      navigate("/dashboard");
    } catch (error) {
        alert(error.response?.data?.error || "Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleLogin}>
        <div className={cx(styles.contain)}>
          <label className={cx(styles.title)}>Log In</label>
          <img
            src="https://kzmgtc0ckt3takuurghg.lite.vusercontent.net/placeholder.svg?height=100&width=100"
            alt="Avatar"
          />
          <div className={cx(styles.input)}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={cx(styles.input)}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={cx(styles.button)}>
            Log In
          </button>
        </div>
      </form>
    </div>
  );
}

export default LogIn;
