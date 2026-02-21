
import classNames from "classnames/bind"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "./Schedule.module.scss"
import { FaChevronLeft, FaChevronRight, FaPlus, FaSearch } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { getMeetingByUser, createMeeting, updateMeeting as updateMeetingAPI, deleteMeeting as deleteMeetingAPI } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.js";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  subDays,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"

const cx = classNames.bind(styles)

function Schedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("week") // 'day', 'week', 'month'
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingMeetingId, setEditingMeetingId] = useState(null)

  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    host: user?.name || "",
    meetingCode: "",
    description: "",
  })
  const [selectedMeeting, setSelectedMeeting] = useState(null)

  const generateMeetingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) code += "-";
    }
    return code;
  };

  const fetchMeetings = async () => {
    try {
      const response = await getMeetingByUser(user?.id);
      const meetingsData = response.data;
      const newMeetings = meetingsData.map((m) => {
        const [year, month, day] = m.date.split("-").map(Number);
        const [hours, minutes] = m.time.split(":").map(Number);
        const startDate = new Date(year, month - 1, day, hours, minutes);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + Number.parseInt(m.duration));
        return {
          id: m.id,
          title: m.description,
          date: startDate,
          endDate: endDate,
          status: m.status,
          codeMeeting: m.meetingCode,
          description: m.description,
          duration: m.duration,
          time: m.time,
          rawDate: m.date,
        };
      });
      setMeetings(newMeetings);
    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMeetings();
    }
  }, [user?.id]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Format month and year for header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMeeting({
      ...newMeeting,
      [name]: value,
    })
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing && editingMeetingId) {
        await updateMeetingAPI(editingMeetingId, {
          description: newMeeting.description,
          date: newMeeting.date,
          time: newMeeting.time,
          duration: newMeeting.duration,
          meetingCode: newMeeting.meetingCode,
        });
      } else {
        const meetingCode = newMeeting.meetingCode || generateMeetingCode();
        await createMeeting({
          host: user?.id,
          description: newMeeting.description || newMeeting.title,
          date: newMeeting.date,
          time: newMeeting.time,
          duration: newMeeting.duration,
          meetingCode: meetingCode,
          status: "scheduled",
        });
      }
      setShowNewMeetingForm(false);
      setIsEditing(false);
      setEditingMeetingId(null);
      setNewMeeting({ title: "", date: "", time: "", duration: 60, host: user?.name || "", meetingCode: "", description: "" });
      await fetchMeetings();
    } catch (err) {
      console.error("Error saving meeting:", err);
      alert("Failed to save meeting. Please try again.");
    }
  }

  // Handle edit button
  const handleEdit = (meeting) => {
    setIsEditing(true);
    setEditingMeetingId(meeting.id);
    setNewMeeting({
      title: meeting.title || "",
      date: meeting.rawDate || "",
      time: meeting.time || "",
      duration: meeting.duration || 60,
      host: user?.name || "",
      meetingCode: meeting.codeMeeting || "",
      description: meeting.description || "",
    });
    setSelectedMeeting(null);
    setShowNewMeetingForm(true);
  };

  // Handle delete button
  const handleDelete = async (meetingId) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
    try {
      await deleteMeetingAPI(meetingId);
      setSelectedMeeting(null);
      await fetchMeetings();
    } catch (err) {
      console.error("Error deleting meeting:", err);
      alert("Failed to delete meeting. Please try again.");
    }
  };

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(
    (meeting) =>
      (meeting.title && meeting.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Get days for week view
  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    const day = currentDate.getDay()
    startOfWeek.setDate(currentDate.getDate() - day)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }

    return days
  }

  // Check if meeting is on the given date
  const isMeetingOnDate = (meeting, date) => {
    return (
      meeting.date.getDate() === date.getDate() &&
      meeting.date.getMonth() === date.getMonth() &&
      meeting.date.getFullYear() === date.getFullYear()
    )
  }

  const getEventsForDay = (day) => {
    return meetings.filter((meeting) => isSameDay(day, meeting.date))
  }

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = subDays(monthStart, getDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd))

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <div className={cx("headerLeft")}>
            <h1>Schedule Meetings</h1>
            <div className={cx("viewToggle")}>
              <button className={cx("viewButton", { active: view === "day" })} onClick={() => setView("day")}>
                Day
              </button>
              <button className={cx("viewButton", { active: view === "week" })} onClick={() => setView("week")}>
                Week
              </button>
              <button className={cx("viewButton", { active: view === "month" })} onClick={() => setView("month")}>
                Month
              </button>
            </div>
          </div>
          <div className={cx("headerRight")}>
            <div className={cx("searchBar")}>
              <FaSearch className={cx("searchIcon")} />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={cx("newMeetingButton")} onClick={() => setShowNewMeetingForm(true)}>
              <FaPlus /> New Meeting
            </button>
          </div>
        </div>

        <div className={cx("calendarHeader")}>
          <h2>{formatMonthYear(currentDate)}</h2>
          <div className={cx("calendarNav")}>
            <button onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            <button className={cx("todayButton")} onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button onClick={goToNext}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        {view === "week" && (
          <div className={cx("weekView")}>
            <div className={cx("weekDays")}>
              {getWeekDays().map((day, index) => (
                <div
                  key={index}
                  className={cx("weekDay", {
                    today: day.toDateString() === new Date().toDateString(),
                  })}
                >
                  <div className={cx("dayName")}>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={cx("dayNumber")}>{day.getDate()}</div>
                </div>
              ))}
            </div>
            <div className={cx("weekMeetings")}>
              {getWeekDays().map((day, index) => (
                <div key={index} className={cx("dayMeetings")}>
                  {filteredMeetings
                    .filter((meeting) => isMeetingOnDate(meeting, day))
                    .map((meeting) => (
                      <div key={meeting.id} className={cx("meetingCard")} onClick={() => setSelectedMeeting(meeting)}>
                        <div className={cx("meetingTime")}>
                          {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                        </div>
                        <h3 className={cx("meetingTitle")}>{meeting.title}</h3>
                        <div className={cx("meetingHost")}>status: {meeting.status}</div>
                        <div className={cx("meetingHost")}>code: {meeting.codeMeeting}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className={cx("dayView")}>
            <h3 className={cx("dayViewDate")}>{formatDate(currentDate)}</h3>
            <div className={cx("dayMeetingsList")}>
              {filteredMeetings
                .filter((meeting) => isMeetingOnDate(meeting, currentDate))
                .map((meeting) => (
                  <div key={meeting.id} className={cx("meetingCardFull")} onClick={() => setSelectedMeeting(meeting)}>
                    <div className={cx("meetingCardHeader")}>
                      <h3>{meeting.title}</h3>
                      <div className={cx("meetingTime")}>
                        {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                      </div>
                    </div>
                    <div className={cx("meetingCardBody")}>
                      <p className={cx("meetingDescription")}>{meeting.description}</p>
                      <div className={cx("meetingHost")}>Host: {meeting.host}</div>
                      <div className={cx("meetingCode")}>Meeting Code: {meeting.codeMeeting}</div>
                    </div>
                  </div>
                ))}
              {filteredMeetings.filter((meeting) => isMeetingOnDate(meeting, currentDate)).length === 0 && (
                <div className={cx("noMeetings")}>No meetings scheduled for this day</div>
              )}
            </div>
          </div>
        )}

        {view === "month" && (
          <div className={cx("scheduleContent")}>
            <div className={cx("monthView")}>
              <div className={cx("monthViewHeader")}>
                <div>Sunday</div>
                <div>Monday</div>
                <div>Tuesday</div>
                <div>Wednesday</div>
                <div>Thursday</div>
                <div>Friday</div>
                <div>Saturday</div>
              </div>
              {/* This would be a calendar grid - simplified for this example */}
              <div className={cx("monthGrid")}>
                {generateCalendarDays().map((day, index) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div
                      key={index}
                      className={cx("monthDay", { otherMonth: !isCurrentMonth, today: isToday })}
                    >
                      <div className={cx("dayNumber")}>{format(day, "d")}</div>
                      <div className={cx("dayEvents")}>
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className={cx("eventPill")}>
                            {event.title || event.status}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className={cx("moreEvents")}>+{dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        )}

        <div className={cx("upcomingMeetings")}>
          <h3>Upcoming Meetings</h3>
          <div className={cx("upcomingList")}>
            {filteredMeetings
              .filter((meeting) => meeting.date > new Date())
              .sort((a, b) => a.date - b.date)
              .slice(0, 3)
              .map((meeting) => (
                <div key={meeting.id} className={cx("upcomingMeetingCard")} onClick={() => setSelectedMeeting(meeting)}>
                  <div className={cx("upcomingDate")}>{formatDate(meeting.date)}</div>
                  <div className={cx("upcomingDetails")}>
                    <h4>{meeting.title}</h4>
                    <div className={cx("upcomingTime")}>
                      {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                    </div>
                    <div className={cx("upcomingHost")}>Code: {meeting.codeMeeting}</div>
                  </div>
                </div>
              ))}
            {filteredMeetings.filter((meeting) => meeting.date > new Date()).length === 0 && (
              <div className={cx("noMeetings")}>No upcoming meetings</div>
            )}
          </div>
        </div>
      </div>

      {/* New Meeting Form Modal */}
      {showNewMeetingForm && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <h2>{isEditing ? "Edit Meeting" : "Schedule New Meeting"}</h2>
              <button className={cx("closeButton")} onClick={() => { setShowNewMeetingForm(false); setIsEditing(false); setEditingMeetingId(null); }}>
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={cx("newMeetingForm")}>
              <div className={cx("formGroup")}>
                <label htmlFor="title">Meeting Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newMeeting.title}
                  onChange={handleInputChange}
                  placeholder="Enter meeting title"
                />
              </div>

              <div className={cx("formRow")}>
                <div className={cx("formGroup")}>
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newMeeting.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newMeeting.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="15"
                    step="15"
                    value={newMeeting.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="meetingCode">Meeting Code (auto-generated if empty)</label>
                <input
                  type="text"
                  id="meetingCode"
                  name="meetingCode"
                  value={newMeeting.meetingCode}
                  onChange={handleInputChange}
                  placeholder="e.g. ABC-DEF-GHI"
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newMeeting.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Meeting details..."
                ></textarea>
              </div>

              <div className={cx("formActions")}>
                <button type="button" className={cx("cancelButton")} onClick={() => { setShowNewMeetingForm(false); setIsEditing(false); setEditingMeetingId(null); }}>
                  Cancel
                </button>
                <button type="submit" className={cx("submitButton")}>
                  {isEditing ? "Update Meeting" : "Schedule Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className={cx("modal")}>
          <div className={cx("modalContent", "meetingDetails")}>
            <div className={cx("modalHeader")}>
              <h2>Meeting Details</h2>
              <button className={cx("closeButton")} onClick={() => setSelectedMeeting(null)}>
                <IoMdClose />
              </button>
            </div>
            <div className={cx("meetingDetailsContent")}>
              <h3>{selectedMeeting.title}</h3>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Date & Time:</div>
                <div className={cx("detailsValue")}>
                  {formatDate(selectedMeeting.date)}, {formatTime(selectedMeeting.date)} -{" "}
                  {formatTime(selectedMeeting.endDate)}
                </div>
              </div>

              <div className={cx("detailsGroup")} style={{ display: "flex" }}>
                <div className={cx("detailsLabel")}>Status:</div>
                <div className={cx("detailsValue")} style={{ marginLeft: "20px" }} >{selectedMeeting.status}</div>
              </div>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Description:</div>
                <div className={cx("detailsValue")}>{selectedMeeting.description}</div>
              </div>

              <div className={cx("detailsGroup")} style={{ display: "flex" }}>
                <div className={cx("detailsLabel")}>Meeting Code:</div>
                <div className={cx("detailsValue")} style={{ marginLeft: "20px" }}>
                  {selectedMeeting.codeMeeting}
                </div>
              </div>

              <div className={cx("meetingActions")}>
                <Link to={`/waiting-room/?room=${selectedMeeting.codeMeeting}`} className={cx("actionButton", "joinButton")}>Join Meeting</Link>
                <button className={cx("actionButton", "editButton")} onClick={() => handleEdit(selectedMeeting)}>Edit</button>
                <button className={cx("actionButton", "deleteButton")} onClick={() => handleDelete(selectedMeeting.id)}>Cancel Meeting</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule

