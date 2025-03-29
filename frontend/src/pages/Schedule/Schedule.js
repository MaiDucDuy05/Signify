"use client"

import classNames from "classnames/bind"
import { useState } from "react"
import styles from "./Schedule.module.scss"
import { FaChevronLeft, FaChevronRight, FaPlus, FaSearch } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"

const cx = classNames.bind(styles)

function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("week") // 'day', 'week', 'month'
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Team Weekly Standup",
      date: new Date(2025, 2, 19, 10, 0), // March 19, 2025, 10:00 AM
      endDate: new Date(2025, 2, 19, 11, 0),
      host: "Duy Mai",
      participants: ["John Doe", "Jane Smith", "Bob Johnson"],
      description: "Weekly team meeting to discuss progress and blockers.",
    },
    {
      id: 2,
      title: "Project Review",
      date: new Date(2025, 2, 20, 14, 0), // March 20, 2025, 2:00 PM
      endDate: new Date(2025, 2, 20, 15, 30),
      host: "Duy Mai",
      participants: ["Alice Brown", "Charlie Davis"],
      description: "Review project milestones and deliverables.",
    },
    {
      id: 3,
      title: "Client Presentation",
      date: new Date(2025, 2, 21, 9, 0), // March 21, 2025, 9:00 AM
      endDate: new Date(2025, 2, 21, 10, 30),
      host: "Duy Mai",
      participants: ["Client A", "Client B", "Sales Team"],
      description: "Present the new product features to the client.",
    },
    {
      id: 4,
      title: "Training Session",
      date: new Date(2025, 2, 22, 13, 0), // March 22, 2025, 1:00 PM
      endDate: new Date(2025, 2, 22, 16, 0),
      host: "Duy Mai",
      participants: ["New Employees", "HR Team"],
      description: "Onboarding training for new team members.",
    },
  ])
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    host: "Duy Mai",
    participants: "",
    description: "",
  })
  const [selectedMeeting, setSelectedMeeting] = useState(null)

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Create date object from form inputs
    const [year, month, day] = newMeeting.date.split("-").map(Number)
    const [hours, minutes] = newMeeting.time.split(":").map(Number)
    const startDate = new Date(year, month - 1, day, hours, minutes)

    // Calculate end date based on duration
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + Number.parseInt(newMeeting.duration))

    // Create new meeting object
    const meeting = {
      id: meetings.length + 1,
      title: newMeeting.title,
      date: startDate,
      endDate: endDate,
      host: newMeeting.host,
      participants: newMeeting.participants.split(",").map((p) => p.trim()),
      description: newMeeting.description,
    }

    // Add to meetings array
    setMeetings([...meetings, meeting])

    // Reset form and close it
    setNewMeeting({
      title: "",
      date: "",
      time: "",
      duration: 60,
      host: "Duy Mai",
      participants: "",
      description: "",
    })
    setShowNewMeetingForm(false)
  }

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.host.toLowerCase().includes(searchQuery.toLowerCase()),
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
                        <div className={cx("meetingHost")}>Host: {meeting.host}</div>
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
                      <div className={cx("meetingParticipants")}>Participants: {meeting.participants.join(", ")}</div>
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
            <div className={cx("monthGrid")}>
              {/* This would be a calendar grid - simplified for this example */}
              <div className={cx("monthViewMessage")}>Month view calendar grid would be implemented here</div>
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
                    <div className={cx("upcomingHost")}>Host: {meeting.host}</div>
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
              <h2>Schedule New Meeting</h2>
              <button className={cx("closeButton")} onClick={() => setShowNewMeetingForm(false)}>
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
                  required
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
                <label htmlFor="host">Host</label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={newMeeting.host}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="participants">Participants (comma separated)</label>
                <input
                  type="text"
                  id="participants"
                  name="participants"
                  value={newMeeting.participants}
                  onChange={handleInputChange}
                  placeholder="John Doe, Jane Smith, etc."
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
                <button type="button" className={cx("cancelButton")} onClick={() => setShowNewMeetingForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={cx("submitButton")}>
                  Schedule Meeting
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

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Host:</div>
                <div className={cx("detailsValue")}>{selectedMeeting.host}</div>
              </div>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Description:</div>
                <div className={cx("detailsValue")}>{selectedMeeting.description}</div>
              </div>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Participants:</div>
                <div className={cx("detailsValue")}>
                  <ul className={cx("participantsList")}>
                    {selectedMeeting.participants.map((participant, index) => (
                      <li key={index}>{participant}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={cx("meetingActions")}>
                <button className={cx("actionButton", "joinButton")}>Join Meeting</button>
                <button className={cx("actionButton", "editButton")}>Edit</button>
                <button className={cx("actionButton", "deleteButton")}>Cancel Meeting</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule

