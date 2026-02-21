
import classNames from "classnames/bind"
import { useEffect, useState } from "react"
import styles from "./DashBoard.module.scss"
import { Link } from "react-router-dom"
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa"
import { CiCalendar } from "react-icons/ci"
import { IoVideocamOutline } from "react-icons/io5"
import { MdOutlineJoinFull } from "react-icons/md"
import { BsCalendarPlus } from "react-icons/bs"
import { MdHistory } from 'react-icons/md';
import { getMeetingByUser } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.js"

const cx = classNames.bind(styles)

function DashBoard() {
  const { user } = useAuth()
  const [time, setTime] = useState(new Date())
  const [todayMeetings, setTodayMeetings] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchTodayMeetings = async () => {
      if (!user?.id) return;
      try {
        const response = await getMeetingByUser(user.id);
        const meetings = response.data || [];
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const filtered = meetings.filter(m => m.date === todayStr);
        setTodayMeetings(filtered);
      } catch (err) {
        console.error("Error fetching meetings:", err);
      }
    };
    fetchTodayMeetings();
  }, [user?.id]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatMeetingTime = (timeStr, duration) => {
    const [h, m] = timeStr.split(":").map(Number);
    const start = new Date(); start.setHours(h, m, 0);
    const end = new Date(start); end.setMinutes(end.getMinutes() + Number(duration));
    const fmt = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    return `${fmt(start)} - ${fmt(end)}`;
  };

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("containLeft")}>
          <h2 className={cx("sectionTitle")}>Quick Actions</h2>
          <div className={cx("containFunction")}>
            <Link to="/new-meeting" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "newMeeting")}>
                  <IoVideocamOutline className={cx("functionIcon")} />
                </div>
                <p>New meeting</p>
              </div>
            </Link>
            <Link to="/waiting-room" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "join")}>
                  <MdOutlineJoinFull className={cx("functionIcon")} />
                </div>
                <p>Join</p>
              </div>
            </Link>
            <Link to="/schedule" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "schedule")}>
                  <BsCalendarPlus className={cx("functionIcon")} />
                </div>
                <p>Schedule</p>
              </div>
            </Link>

            <Link to="/history-meeting" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "shareScreen")}>
                  <MdHistory className={cx("functionIcon")} />
                </div>
                <p>History Meeting</p>
              </div>
            </Link>
          </div>
        </div>

        <div className={cx("containRight")}>
          <div className={cx("timeCard")}>
            <h2>{formatTime(time)}</h2>
            <p>{formatDate(time)}</p>
          </div>

          <div className={cx("meetingsSection")}>
            <div className={cx("containRightHeader")}>
              <div className={cx("headerLeft")}>
                <h3>
                  Today <FaChevronDown className={cx("dropdownIcon")} />
                </h3>
              </div>
              <div className={cx("headerRight")}>
                <button className={cx("calendarButton")}>
                  <FaChevronLeft />
                </button>
                <button className={cx("calendarButton")}>
                  <CiCalendar />
                </button>
                <button className={cx("calendarButton")}>
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className={cx("containRightHistory")}>
              {todayMeetings.length === 0 ? (
                <div className={cx("containRightHistoryItem")}>
                  <h4>No meetings today</h4>
                  <div className={cx("meetingDetails")}>
                    <p>Your schedule is clear!</p>
                  </div>
                </div>
              ) : (
                todayMeetings.map((meeting) => (
                  <div key={meeting.id} className={cx("containRightHistoryItem")}>
                    <h4>{meeting.description || "Meeting"}</h4>
                    <div className={cx("meetingDetails")}>
                      <p>Today</p>
                      <p>{formatMeetingTime(meeting.time, meeting.duration)}</p>
                      <p>Status: {meeting.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard

