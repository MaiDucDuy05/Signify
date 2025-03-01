import classNames from 'classnames/bind';
import { useNavigate } from "react-router-dom"; 
import { useState } from 'react';
import { CiVideoOn } from "react-icons/ci";
import { Link } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";

import styles from './Header.module.scss';
import { useAuth } from "../../context/AuthContext";


const cx = classNames.bind(styles);

function Header() {
    const [isOpenLogin,setIsOpenLogin] = useState(1)
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        logout()  
        navigate("/");    
    };


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
                    user && (<div className={cx(styles.search)}>
                    <i><IoIosSearch /></i>
                    <input type='search' placeholder='Search'></input>
                </div>)
                }
                
                </div>
                
                {!user ? (
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
                        <img onClick={() => {setIsOpenLogin(1 - isOpenLogin)}}  src={user?.imgLink} alt="User Avatar" />
                        <span className={cx(styles.userName)}>{user?.name || "User"}</span>
                        <button className={cx(styles.logOut,{[styles.appear]:isOpenLogin === 0})} onClick={handleLogout}>
                            <i><IoLogInOutline /></i> Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
