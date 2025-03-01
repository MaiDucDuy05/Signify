import classNames from "classnames/bind";
import { Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WattingRoom.module.scss";


const cx = classNames.bind(styles);

function WattingRoom() {

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (!inputValue.trim()) {
            setError("Vui lòng nhập dữ liệu!"); 
            return;
        }
        setError("");
        navigate(`/meeting?data=${encodeURIComponent(inputValue)}`);
    };
   
    return (
        <div className={styles.wrap}>
            <div className={cx(styles.contain)}>
                <label className={cx(styles.title)}>Welcome to Video Chat</label>
                <div className={cx(styles.input)}>
                    <label>Meeting Code</label>
                    <input  placeholder="Enter meeting code" 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            required
                    ></input>
                </div>
                    <Button onClick={handleSubmit} type="primary" className={cx(styles.buttonItem1)}>
                        Join Meeting
                    </Button>
                <span className={cx(styles.textOr)}>OR</span>
                <Button type="default" className={cx(styles.buttonItem2)}>
                    Create New Meeting
                </Button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}

export default WattingRoom;
