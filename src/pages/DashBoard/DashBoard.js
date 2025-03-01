import classNames from 'classnames/bind';
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from 'react';
import styles from './DashBoard.module.scss';
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";

const cx = classNames.bind(styles);

function DashBoard() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000); // Cập nhật mỗi giây
        return () => clearInterval(interval);
    }, []);

    // Định dạng thời gian
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    // Định dạng ngày tháng
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className={cx(styles.wrap)}>
            <div className={styles.containLeft}>
                <div className={styles.containFunction}>
                    <Link to = "/meeting"> <li><img src='https://cdn.tgdd.vn/2021/10/GameApp/zoom-icon-logo-200x200.png' alt="new meeting" /><p>New meeting</p></li></Link>
                    <Link to = '/waiting-room'> <li><img src='https://cdn.tgdd.vn/2021/10/GameApp/zoom-icon-logo-200x200.png' alt="join" /><p>Join</p></li></Link>
                    <li><img src='https://cdn.tgdd.vn/2021/10/GameApp/zoom-icon-logo-200x200.png' alt="schedule" /><p>Schedule</p></li>
                    <li><img src='https://cdn.tgdd.vn/2021/10/GameApp/zoom-icon-logo-200x200.png' alt="share screen" /><p>Share screen</p></li>
                </div>
            </div>

            <div className={styles.containRight}>
                <div className={styles.Time}>
                    <h2>{formatTime(time)}</h2>
                    <p>{formatDate(time)}</p>
                </div>
                <div className={styles.containRightHeader}>
                    <li>
                        <h5>Today <span style={{ position: "relative", top: "5px" }}><FaChevronDown /></span></h5>
                    </li>
                    <li>
                        <i><FaChevronLeft /></i>
                        <i><CiCalendar /></i>
                        <i><FaChevronRight /></i>
                    </li>
                </div>
                <div className={styles.containRightHistory}>
                    <li className={styles.containRightHistoryItem}>
                        <h4>Hoc Tap Truc Tuyen</h4>
                        <p>Today</p>
                        <p>2:52 - 3:32 PM</p>
                        <p>Host: Duy Mai</p>
                    </li>
                    <li className={styles.containRightHistoryItem}>
                        <h4>Hoc Tap Truc Tuyen</h4>
                        <p>Today</p>
                        <p>2:52 - 3:32 PM</p>
                        <p>Host: Duy Mai</p>
                    </li>
                    <li className={styles.containRightHistoryItem}>
                        <h4>Hoc Tap Truc Tuyen</h4>
                        <p>Today</p>
                        <p>2:52 - 3:32 PM</p>
                        <p>Host: Duy Mai</p>
                    </li>
                    <li className={styles.containRightHistoryItem}>
                        <h4>Hoc Tap Truc Tuyen</h4>
                        <p>Today</p>
                        <p>2:52 - 3:32 PM</p>
                        <p>Host: Duy Mai</p>
                    </li>
                </div>
            </div>
        </div>
    );
}

export default DashBoard;
