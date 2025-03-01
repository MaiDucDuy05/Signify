import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { saveAuthToken } from "../../token";
import { users } from "../../db/db";

const cx = classNames.bind(styles);



function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    let userLogin = users.find(user => email === user.email && password === user.password);

    if (!userLogin) {
        alert("Sai email hoặc mật khẩu!");
    } else {
        const token = JSON.stringify({ id: userLogin.id, name: userLogin.name,imgLink:userLogin.imgLink });
        saveAuthToken(token); 
        navigate("/dashboard"); 
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
