
import { useState, useEffect } from "react"
import classNames from "classnames/bind"
import styles from "./HistoryMeeting.module.scss"
import { FaSearch, FaCalendarAlt, FaChevronDown, FaChevronUp, FaDownload, FaShare } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { CiClock1 } from "react-icons/ci"
import { BsPersonCircle } from "react-icons/bs"
import { SiOpenai } from 'react-icons/si';
import { getMeetingByUser, getMessages } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.js"

const cx = classNames.bind(styles)

function HistoryMeeting() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [expandedMeetings, setExpandedMeetings] = useState({})
  const [meetingMessages, setMeetingMessages] = useState({})

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.id) return;
      try {
        const response = await getMeetingByUser(user.id);
        const allMeetings = response.data || [];

        const pastMeetings = allMeetings
          .filter(m => m.status === "ended" || new Date(`${m.date}T${m.time}`) < new Date())
          .map(m => ({
            id: m.id,
            title: m.description || "Meeting",
            date: new Date(`${m.date}T${m.time}`),
            duration: Number(m.duration) || 60,
            description: m.description || "",
            meetingCode: m.meetingCode,
            status: m.status,
            aiSummary: "AI summary is not available for this meeting yet.",
          }));

        setMeetings(pastMeetings);
      } catch (err) {
        console.error("Error fetching meeting history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [user?.id]);

  const fetchMessagesForMeeting = async (meetingId) => {
    if (meetingMessages[meetingId]) return;
    try {
      const response = await getMessages(meetingId);
      const messages = (response.data || []).map((msg, i) => ({
        id: msg.id || i,
        sender: msg.senderName || "User",
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
        content: msg.text,
      }));
      setMeetingMessages(prev => ({ ...prev, [meetingId]: messages }));
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMeetingMessages(prev => ({ ...prev, [meetingId]: [] }));
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  const calculateEndTime = (date, durationMinutes) => {
    const endTime = new Date(date)
    endTime.setMinutes(endTime.getMinutes() + durationMinutes)
    return endTime
  }

  const toggleMeetingExpansion = (meetingId) => {
    setExpandedMeetings({
      ...expandedMeetings,
      [meetingId]: !expandedMeetings[meetingId],
    })
  }

  const handleViewConversation = async (meeting) => {
    await fetchMessagesForMeeting(meeting.id);
    setSelectedMeeting({ ...meeting, viewSummary: false });
  }

  const handleViewSummary = (meeting) => {
    setSelectedMeeting({ ...meeting, viewSummary: true });
  }

  // Download chat transcript as .txt
  const handleDownload = (meeting) => {
    const messages = meetingMessages[meeting.id] || [];
    let content = `Meeting: ${meeting.title}\n`;
    content += `Date: ${formatDate(meeting.date)}\n`;
    content += `Time: ${formatTime(meeting.date)} - ${formatTime(calculateEndTime(meeting.date, meeting.duration))}\n`;
    content += `Meeting Code: ${meeting.meetingCode}\n`;
    content += `---\n\n`;

    if (messages.length === 0) {
      content += "No messages in this meeting.\n";
    } else {
      messages.forEach((msg) => {
        content += `[${msg.time}] ${msg.sender}: ${msg.content}\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy meeting link to clipboard
  const handleShare = async (meeting) => {
    const link = `${window.location.origin}/waiting-room/?room=${meeting.meetingCode}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Meeting link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      prompt("Copy this link:", link);
    }
  };

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className={cx("wrap")}>
        <div className={cx("container")}>
          <div className={cx("header")}>
            <h1>Meeting History</h1>
          </div>
          <div className={cx("noMeetings")}><p>Loading meetings...</p></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <h1>Meeting History</h1>
          <div className={cx("searchBar")}>
            <FaSearch className={cx("searchIcon")} />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={cx("meetingsList")}>
          {filteredMeetings.length === 0 ? (
            <div className={cx("noMeetings")}>
              <p>No past meetings found</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className={cx("meetingCard")}>
                <div className={cx("meetingHeader")} onClick={() => toggleMeetingExpansion(meeting.id)}>
                  <div className={cx("meetingInfo")}>
                    <h2>{meeting.title}</h2>
                    <div className={cx("meetingMeta")}>
                      <div className={cx("metaItem")}>
                        <FaCalendarAlt />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className={cx("metaItem")}>
                        <CiClock1 />
                        <span>
                          {formatTime(meeting.date)} - {formatTime(calculateEndTime(meeting.date, meeting.duration))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={cx("meetingActions")}>
                    <button className={cx("expandButton")}>
                      {expandedMeetings[meeting.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedMeetings[meeting.id] && (
                  <div className={cx("meetingContent")}>
                    <div className={cx("meetingDescription")}>
                      <p>{meeting.description}</p>
                      <div className={cx("participantsInfo")}>
                        <strong>Meeting Code:</strong> {meeting.meetingCode}
                        <strong className={cx("participantsLabel")}>Status:</strong>
                        <span>{meeting.status}</span>
                      </div>
                    </div>

                    <div className={cx("meetingTabs")}>
                      <button className={cx("tabButton", "primary")} onClick={() => handleViewConversation(meeting)}>
                        View Conversation
                      </button>
                      <button
                        className={cx("tabButton")}
                        onClick={() => handleViewSummary(meeting)}
                      >
                        View AI Summary
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Meeting Conversation Modal */}
      {selectedMeeting && !selectedMeeting.viewSummary && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <div>
                <h2>{selectedMeeting.title}</h2>
                <p className={cx("modalSubtitle")}>
                  {formatDate(selectedMeeting.date)} • {formatTime(selectedMeeting.date)} -{" "}
                  {formatTime(calculateEndTime(selectedMeeting.date, selectedMeeting.duration))}
                </p>
              </div>
              <div className={cx("modalActions")}>
                <button className={cx("modalActionButton")} title="Download transcript" onClick={() => handleDownload(selectedMeeting)}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")} title="Share meeting link" onClick={() => handleShare(selectedMeeting)}>
                  <FaShare />
                </button>
                <button className={cx("modalActionButton")} onClick={() => setSelectedMeeting(null)}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className={cx("modalBody")}>
              <div className={cx("conversationContainer")}>
                {(meetingMessages[selectedMeeting.id] || []).length === 0 ? (
                  <div className={cx("noMeetings")}><p>No messages in this meeting</p></div>
                ) : (
                  (meetingMessages[selectedMeeting.id] || []).map((message) => (
                    <div key={message.id} className={cx("messageItem")}>
                      <div className={cx("messageSender")}>
                        <div className={cx("senderAvatar")}>
                          <BsPersonCircle />
                        </div>
                        <div className={cx("senderInfo")}>
                          <div className={cx("senderName")}>{message.sender}</div>
                          <div className={cx("messageTime")}>{message.time}</div>
                        </div>
                      </div>
                      <div className={cx("messageContent")}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={cx("modalFooter")}>
              <button
                className={cx("viewSummaryButton")}
                onClick={() => setSelectedMeeting({ ...selectedMeeting, viewSummary: true })}
              >
                <SiOpenai />
                View AI Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Summary Modal */}
      {selectedMeeting && selectedMeeting.viewSummary && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <div>
                <h2>AI Summary: {selectedMeeting.title}</h2>
                <p className={cx("modalSubtitle")}>
                  {formatDate(selectedMeeting.date)} • {formatTime(selectedMeeting.date)} -{" "}
                  {formatTime(calculateEndTime(selectedMeeting.date, selectedMeeting.duration))}
                </p>
              </div>
              <div className={cx("modalActions")}>
                <button className={cx("modalActionButton")} title="Download summary" onClick={() => handleDownload(selectedMeeting)}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")} title="Share meeting link" onClick={() => handleShare(selectedMeeting)}>
                  <FaShare />
                </button>
                <button className={cx("modalActionButton")} onClick={() => setSelectedMeeting(null)}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className={cx("modalBody")}>
              <div className={cx("summaryContainer")}>
                <div className={cx("summaryHeader")}>
                  <SiOpenai className={cx("aiIcon")} />
                  <h3>Meeting Summary</h3>
                </div>
                <div className={cx("summaryContent")}>
                  <p>{selectedMeeting.aiSummary}</p>
                </div>
              </div>
            </div>
            <div className={cx("modalFooter")}>
              <button
                className={cx("viewConversationButton")}
                onClick={() => setSelectedMeeting({ ...selectedMeeting, viewSummary: false })}
              >
                View Full Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryMeeting
