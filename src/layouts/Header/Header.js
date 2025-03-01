import classNames from 'classnames/bind';
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from 'react';
import styles from './Header.module.scss';
import { CiVideoOn } from "react-icons/ci";
import { Link } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../../token";
import { IoLogInOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";

const cx = classNames.bind(styles);

function Header() {
    const [isOpenLogin,setIsOpenLogin] = useState(1)
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    const handleLogout = async () => {
        removeAuthToken(); 
        setToken(null);  
        navigate("/");    
    };


    useEffect(() => {
        try {
            const authToken = getAuthToken();
            setToken(authToken ? JSON.parse(authToken) : null);  
        } catch (error) {
            console.error("Lỗi khi lấy hoặc parse token:", error);
            setToken(null);
        }
    }, []); 

    return (
        <div className={cx(styles.wrap)}>
            <div className={cx(styles.contain)}>
                <div className={cx(styles.containLeft)}>
                <Link  to='/'>
                    <div className={cx(styles.logo)}>
                        <span className={cx(styles.videoIcon)}>
                            <CiVideoOn />
                        </span>
                        Signify
                    </div>
                </Link>
                {
                    token && (<div className={cx(styles.search)}>
                    <i><IoIosSearch /></i>
                    <input type='search' placeholder='Search'></input>
                </div>)
                }
                
                </div>
                
                {!token ? (
                    <div className={cx(styles.authentication)}>
                        <Link to='/login'>
                            <div className={cx(styles.logIn)}>Log In</div>
                        </Link>
                        <Link to='/signup'>
                            <div className={cx(styles.SignUp)}>Sign Up</div>
                        </Link>
                        
                    </div>
                ) : (
                    <div className={cx(styles.authentication)}>
                        <div className={cx(styles.navBar)}>
                            <li><i><FaHome /></i> Home</li>
                            <li><i><FaVideo /></i>Meeting</li>
                        </div>
                        <img onClick={() => {setIsOpenLogin(1 - isOpenLogin)}}  src={token?.imgLink} alt="User Avatar" />
                        <span className={cx(styles.userName)}>{token?.name || "User"}</span>
                        <button className={cx(styles.logOut,{[styles.disable]:isOpenLogin})} onClick={handleLogout}>
                            <i><IoLogInOutline /></i> Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
