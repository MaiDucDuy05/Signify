import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { Button } from "antd";
import styles from "./WattingRoom.module.scss";
import { Link } from "react-router-dom";
import { getAuthToken } from "../../token";


const cx = classNames.bind(styles);

function WattingRoom() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = getAuthToken(); 
        if (!token) {
            navigate("/"); 
        }
    }, []);

    return (
        <div className={styles.wrap}>
            <div className={cx(styles.contain)}>
                <label className={cx(styles.title)}>Welcome to Video Chat</label>
                <div className={cx(styles.input)}>
                    <label>Meeting Code</label>
                    <input placeholder="Enter meeting code" type="text"></input>
                </div>
                <Link to="/meeting">
                    <Button type="primary" className={cx(styles.buttonItem1)}>
                        Join Meeting
                    </Button>
                </Link>
                <span className={cx(styles.textOr)}>OR</span>
                <Button type="default" className={cx(styles.buttonItem2)}>
                    Create New Meeting
                </Button>
            </div>
        </div>
    );
}

export default WattingRoom;
