import classNames from 'classnames/bind';
import { CiVideoOn } from "react-icons/ci";
import { Button } from 'antd';
import styles from './Home.module.scss';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getAuthToken } from '../../token'; 

const cx = classNames.bind(styles);

function Home() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const authToken = await getAuthToken();
                if (authToken) {
                    setToken(authToken);
                    navigate("/dashboard"); 
                }
            } catch (error) {
                console.error("Lỗi khi lấy token:", error);
                setToken(null);
            }
        };

        checkLogin();
    }, [navigate]);

    return (
        <div className={cx(styles.wrap)}>
            <div className={cx(styles.contain)}>
                <div className={cx(styles.logo)}>
                    <span className={cx(styles.videoIcon)}><CiVideoOn /></span> Signify
                </div>
                <h4 className={cx(styles.text)}>Connect with anyone, anywhere, anytime</h4>
                <div className={cx(styles.button)}>
                    <Link to="/login">
                        <Button type="primary" className={cx(styles.buttonGetStart)}>Get Started</Button>
                    </Link>
                    <Link to="/login">
                        <Button type="default" className={cx(styles.buttonLearnMore)}>Learn More</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
