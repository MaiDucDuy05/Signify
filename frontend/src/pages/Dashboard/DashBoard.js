"use client"

import classNames from "classnames/bind"
import { useEffect, useState } from "react"
import styles from "./DashBoard.module.scss"
import { Link } from "react-router-dom"
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa"
import { CiCalendar } from "react-icons/ci"
import { IoVideocamOutline } from "react-icons/io5"
import { MdOutlineJoinFull } from "react-icons/md"
import { BsCalendarPlus } from "react-icons/bs"
import { LuScreenShare } from "react-icons/lu"
import { MdHistory } from 'react-icons/md';

const cx = classNames.bind(styles)

function DashBoard() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000) // Update every second
    return () => clearInterval(interval)
  }, [])

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  }

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

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
            <Link to ="/schedule" className={cx("functionLink")}>
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
              <div className={cx("containRightHistoryItem")}>
                <h4>Hoc Tap Truc Tuyen</h4>
                <div className={cx("meetingDetails")}>
                  <p>Today</p>
                  <p>2:52 - 3:32 PM</p>
                  <p>Host: Duy Mai</p>
                </div>
              </div>
              <div className={cx("containRightHistoryItem")}>
                <h4>Hoc Tap Truc Tuyen</h4>
                <div className={cx("meetingDetails")}>
                  <p>Today</p>
                  <p>2:52 - 3:32 PM</p>
                  <p>Host: Duy Mai</p>
                </div>
              </div>
              <div className={cx("containRightHistoryItem")}>
                <h4>Hoc Tap Truc Tuyen</h4>
                <div className={cx("meetingDetails")}>
                  <p>Today</p>
                  <p>2:52 - 3:32 PM</p>
                  <p>Host: Duy Mai</p>
                </div>
              </div>
              <div className={cx("containRightHistoryItem")}>
                <h4>Hoc Tap Truc Tuyen</h4>
                <div className={cx("meetingDetails")}>
                  <p>Today</p>
                  <p>2:52 - 3:32 PM</p>
                  <p>Host: Duy Mai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard

