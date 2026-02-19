
import { useState } from "react"
import classNames from "classnames/bind"
import styles from "./HistoryMeeting.module.scss"
import { FaSearch, FaCalendarAlt, FaChevronDown, FaChevronUp, FaDownload, FaShare } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { CiClock1 } from "react-icons/ci"
import { BsPersonCircle, BsThreeDotsVertical } from "react-icons/bs"
import { SiOpenai } from 'react-icons/si';

const cx = classNames.bind(styles)

function HistoryMeeting() {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Product Development Meeting",
      date: new Date(2025, 2, 15, 10, 0),
      duration: 75,
      host: "Duy Mai",
      participants: ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown"],
      description: "Discussion about the new product features and roadmap.",
      messages: [
        { id: 1, sender: "Duy Mai", time: "10:02 AM", content: "Welcome everyone to our product development meeting." },
        {
          id: 2,
          sender: "John Doe",
          time: "10:03 AM",
          content: "Thanks for organizing this. I have some ideas about the new UI design.",
        },
        {
          id: 3,
          sender: "Jane Smith",
          time: "10:05 AM",
          content: "I've prepared a presentation about user feedback from our beta testers.",
        },
        {
          id: 4,
          sender: "Bob Johnson",
          time: "10:08 AM",
          content: "Can we discuss the timeline for the next release?",
        },
        {
          id: 5,
          sender: "Duy Mai",
          time: "10:10 AM",
          content: "Yes, let's go through the agenda first and then we'll discuss the timeline.",
        },
        {
          id: 6,
          sender: "Alice Brown",
          time: "10:12 AM",
          content: "I've identified some performance issues that we should address before the next release.",
        },
        { id: 7, sender: "John Doe", time: "10:15 AM", content: "Great point, Alice. Let's prioritize those issues." },
        {
          id: 8,
          sender: "Duy Mai",
          time: "10:18 AM",
          content: "Let's move on to Jane's presentation about user feedback.",
        },
        {
          id: 9,
          sender: "Jane Smith",
          time: "10:20 AM",
          content:
            "Based on our surveys, users are really happy with the new dashboard but find the settings page confusing.",
        },
        { id: 10, sender: "Bob Johnson", time: "10:25 AM", content: "I can work on simplifying the settings page UI." },
        {
          id: 11,
          sender: "Duy Mai",
          time: "10:30 AM",
          content: "Perfect. Now let's discuss the timeline for the next release.",
        },
        {
          id: 12,
          sender: "John Doe",
          time: "10:35 AM",
          content: "I think we can have the new features ready by the end of the month.",
        },
        {
          id: 13,
          sender: "Alice Brown",
          time: "10:40 AM",
          content: "That seems reasonable if we prioritize correctly.",
        },
        {
          id: 14,
          sender: "Duy Mai",
          time: "10:45 AM",
          content: "Great, let's aim for a release by the end of the month. Any other topics we should discuss?",
        },
        { id: 15, sender: "Jane Smith", time: "10:50 AM", content: "I think we've covered everything for today." },
        {
          id: 16,
          sender: "Duy Mai",
          time: "10:55 AM",
          content: "Alright, thank you everyone for your input. Let's meet again next week to track our progress.",
        },
      ],
      aiSummary:
        "The product development team discussed new UI features, user feedback, and performance issues. Jane presented user feedback showing satisfaction with the dashboard but confusion with the settings page, which Bob will work on simplifying. The team agreed to aim for a release by the end of the month, with John confident about meeting this timeline. Key action items include addressing performance issues identified by Alice and simplifying the settings page UI. A follow-up meeting is scheduled for next week to track progress.",
    },
    {
      id: 2,
      title: "Marketing Strategy Session",
      date: new Date(2025, 2, 10, 14, 0),
      duration: 60,
      host: "Duy Mai",
      participants: ["Sarah Wilson", "Mike Thompson", "Emily Davis"],
      description: "Planning our Q2 marketing campaigns and budget allocation.",
      messages: [
        { id: 1, sender: "Duy Mai", time: "2:00 PM", content: "Welcome to our marketing strategy session for Q2." },
        {
          id: 2,
          sender: "Sarah Wilson",
          time: "2:03 PM",
          content: "I've analyzed our Q1 campaigns and have some insights to share.",
        },
        {
          id: 3,
          sender: "Mike Thompson",
          time: "2:05 PM",
          content: "Great, I'm also interested in discussing our social media strategy.",
        },
        {
          id: 4,
          sender: "Emily Davis",
          time: "2:08 PM",
          content: "I've prepared a budget proposal for our Q2 campaigns.",
        },
        { id: 5, sender: "Duy Mai", time: "2:10 PM", content: "Let's start with Sarah's insights from Q1." },
        {
          id: 6,
          sender: "Sarah Wilson",
          time: "2:12 PM",
          content: "Our email campaigns had a 25% higher conversion rate than social media ads.",
        },
        {
          id: 7,
          sender: "Mike Thompson",
          time: "2:15 PM",
          content: "That's interesting. Maybe we should reallocate some budget from social to email.",
        },
        {
          id: 8,
          sender: "Emily Davis",
          time: "2:18 PM",
          content: "I think we should still maintain our social presence but optimize our targeting.",
        },
        { id: 9, sender: "Duy Mai", time: "2:20 PM", content: "Good point. Let's look at Emily's budget proposal." },
        {
          id: 10,
          sender: "Emily Davis",
          time: "2:25 PM",
          content: "I'm proposing a 15% increase for email marketing and a 5% decrease for paid social ads.",
        },
        {
          id: 11,
          sender: "Sarah Wilson",
          time: "2:30 PM",
          content: "That aligns with our Q1 results. I support this allocation.",
        },
        {
          id: 12,
          sender: "Mike Thompson",
          time: "2:35 PM",
          content: "I agree, but let's make sure we're optimizing our remaining social budget effectively.",
        },
        {
          id: 13,
          sender: "Duy Mai",
          time: "2:40 PM",
          content: "Sounds like we have consensus. Mike, can you prepare a plan for optimizing our social media spend?",
        },
        { id: 14, sender: "Mike Thompson", time: "2:45 PM", content: "Yes, I'll have that ready by next week." },
        { id: 15, sender: "Duy Mai", time: "2:50 PM", content: "Great. Any other topics we should discuss today?" },
        { id: 16, sender: "Sarah Wilson", time: "2:52 PM", content: "I think we've covered the main points for now." },
        {
          id: 17,
          sender: "Duy Mai",
          time: "2:55 PM",
          content: "Excellent. Let's reconvene next week to review Mike's social media optimization plan.",
        },
      ],
      aiSummary:
        "The marketing team analyzed Q1 results and planned Q2 strategy. Sarah reported email campaigns outperformed social media by 25% in conversion rates. Emily proposed a budget reallocation with a 15% increase for email marketing and 5% decrease for social ads, which the team approved. Mike will prepare a social media optimization plan by next week to ensure effective use of the remaining social budget. The team will meet again next week to review this plan.",
    },
    {
      id: 3,
      title: "Client Onboarding: XYZ Corp",
      date: new Date(2025, 2, 5, 11, 0),
      duration: 45,
      host: "Duy Mai",
      participants: ["David Lee", "Lisa Wang", "Client Representative"],
      description: "Initial meeting with XYZ Corp to discuss project requirements and timeline.",
      messages: [
        {
          id: 1,
          sender: "Duy Mai",
          time: "11:00 AM",
          content: "Welcome to our onboarding meeting. We're excited to work with XYZ Corp.",
        },
        {
          id: 2,
          sender: "Client Representative",
          time: "11:02 AM",
          content: "Thank you for having us. We're looking forward to this partnership.",
        },
        {
          id: 3,
          sender: "David Lee",
          time: "11:05 AM",
          content: "I'll be your project manager throughout this engagement.",
        },
        {
          id: 4,
          sender: "Lisa Wang",
          time: "11:07 AM",
          content: "And I'll be handling the technical implementation of your solution.",
        },
        {
          id: 5,
          sender: "Client Representative",
          time: "11:10 AM",
          content: "Great. Our main priority is to have the system up and running by the end of Q2.",
        },
        {
          id: 6,
          sender: "David Lee",
          time: "11:12 AM",
          content: "That timeline works for us. Can you tell us more about your specific requirements?",
        },
        {
          id: 7,
          sender: "Client Representative",
          time: "11:15 AM",
          content: "We need a solution that integrates with our existing CRM and provides real-time analytics.",
        },
        { id: 8, sender: "Lisa Wang", time: "11:18 AM", content: "Which CRM system are you currently using?" },
        {
          id: 9,
          sender: "Client Representative",
          time: "11:20 AM",
          content: "We're using Salesforce with some custom modules.",
        },
        {
          id: 10,
          sender: "Lisa Wang",
          time: "11:22 AM",
          content: "Perfect, we have extensive experience with Salesforce integration.",
        },
        {
          id: 11,
          sender: "David Lee",
          time: "11:25 AM",
          content: "Let's discuss the project phases and deliverables.",
        },
        {
          id: 12,
          sender: "Duy Mai",
          time: "11:30 AM",
          content: "I propose we start with a discovery phase, followed by design, implementation, and testing.",
        },
        {
          id: 13,
          sender: "Client Representative",
          time: "11:35 AM",
          content: "That sounds comprehensive. When can we expect to receive the detailed project plan?",
        },
        {
          id: 14,
          sender: "David Lee",
          time: "11:38 AM",
          content: "I'll send you the detailed plan by the end of this week.",
        },
        {
          id: 15,
          sender: "Duy Mai",
          time: "11:40 AM",
          content: "Great. Any other questions or concerns before we wrap up?",
        },
        {
          id: 16,
          sender: "Client Representative",
          time: "11:42 AM",
          content: "Not at the moment. We're excited to get started.",
        },
        {
          id: 17,
          sender: "Duy Mai",
          time: "11:45 AM",
          content: "Excellent. We'll be in touch with the project plan soon.",
        },
      ],
      aiSummary:
        "This onboarding meeting with XYZ Corp established project parameters and introductions. David Lee will serve as project manager with Lisa Wang handling technical implementation. The client needs a solution that integrates with their Salesforce CRM (with custom modules) and provides real-time analytics, with completion required by the end of Q2. The team proposed a phased approach: discovery, design, implementation, and testing. David will deliver a detailed project plan by the end of the week. Both parties expressed enthusiasm about the partnership.",
    },
    {
      id: 4,
      title: "Team Retrospective",
      date: new Date(2025, 1, 28, 15, 0),
      duration: 60,
      host: "Duy Mai",
      participants: ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Mike Thompson"],
      description: "Monthly retrospective to discuss what went well and areas for improvement.",
      messages: [
        {
          id: 1,
          sender: "Duy Mai",
          time: "3:00 PM",
          content: "Welcome to our monthly retrospective. Let's start by discussing what went well this month.",
        },
        {
          id: 2,
          sender: "John Doe",
          time: "3:03 PM",
          content: "The product release went smoothly with minimal bugs reported.",
        },
        {
          id: 3,
          sender: "Jane Smith",
          time: "3:05 PM",
          content: "Customer feedback has been overwhelmingly positive about the new features.",
        },
        {
          id: 4,
          sender: "Bob Johnson",
          time: "3:08 PM",
          content: "Our development velocity increased by 20% compared to last month.",
        },
        {
          id: 5,
          sender: "Duy Mai",
          time: "3:10 PM",
          content: "Those are great achievements. Now let's discuss areas where we can improve.",
        },
        {
          id: 6,
          sender: "Alice Brown",
          time: "3:12 PM",
          content: "Our documentation is falling behind the development pace.",
        },
        {
          id: 7,
          sender: "Mike Thompson",
          time: "3:15 PM",
          content: "We had some communication gaps between the design and development teams.",
        },
        {
          id: 8,
          sender: "John Doe",
          time: "3:18 PM",
          content: "I agree. We should establish a better process for design handoffs.",
        },
        {
          id: 9,
          sender: "Duy Mai",
          time: "3:20 PM",
          content: "Good points. Let's brainstorm some solutions for these issues.",
        },
        {
          id: 10,
          sender: "Jane Smith",
          time: "3:23 PM",
          content: "We could allocate dedicated time each sprint for documentation updates.",
        },
        {
          id: 11,
          sender: "Bob Johnson",
          time: "3:26 PM",
          content: "And maybe have joint design-dev sessions before starting implementation.",
        },
        {
          id: 12,
          sender: "Alice Brown",
          time: "3:30 PM",
          content: "I like both of those ideas. I can help coordinate the documentation efforts.",
        },
        {
          id: 13,
          sender: "Mike Thompson",
          time: "3:33 PM",
          content: "I'll work with the design team to establish a better handoff process.",
        },
        {
          id: 14,
          sender: "Duy Mai",
          time: "3:36 PM",
          content: "Great. Let's also discuss our goals for the next month.",
        },
        {
          id: 15,
          sender: "John Doe",
          time: "3:40 PM",
          content: "I think we should focus on improving our test coverage.",
        },
        {
          id: 16,
          sender: "Jane Smith",
          time: "3:43 PM",
          content: "And I'd like to see us implement some of the most requested customer features.",
        },
        {
          id: 17,
          sender: "Duy Mai",
          time: "3:46 PM",
          content:
            "Those sound like good priorities. Let's make sure we document these action items and follow up next week.",
        },
        {
          id: 18,
          sender: "Bob Johnson",
          time: "3:50 PM",
          content: "I'll send out the meeting notes with action items by tomorrow.",
        },
        {
          id: 19,
          sender: "Duy Mai",
          time: "3:55 PM",
          content: "Thank you everyone for your participation. Let's continue this momentum into next month.",
        },
      ],
      aiSummary:
        "The team retrospective highlighted several successes: a smooth product release with minimal bugs, positive customer feedback on new features, and a 20% increase in development velocity. Areas for improvement included documentation falling behind development and communication gaps between design and development teams. The team proposed solutions: dedicated time each sprint for documentation updates (Alice will coordinate) and joint design-dev sessions before implementation (Mike will establish a better handoff process). Goals for the next month include improving test coverage and implementing highly requested customer features. Bob will distribute meeting notes with action items by the following day.",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [expandedMeetings, setExpandedMeetings] = useState({})

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  // Calculate meeting end time
  const calculateEndTime = (date, durationMinutes) => {
    const endTime = new Date(date)
    endTime.setMinutes(endTime.getMinutes() + durationMinutes)
    return endTime
  }

  // Toggle meeting expansion
  const toggleMeetingExpansion = (meetingId) => {
    setExpandedMeetings({
      ...expandedMeetings,
      [meetingId]: !expandedMeetings[meetingId],
    })
  }

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.host.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
              <p>No meetings found</p>
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
                        <strong>Host:</strong> {meeting.host}
                        <strong className={cx("participantsLabel")}>Participants:</strong>
                        <span>{meeting.participants.join(", ")}</span>
                      </div>
                    </div>

                    <div className={cx("meetingTabs")}>
                      <button className={cx("tabButton", "primary")} onClick={() => setSelectedMeeting(meeting)}>
                        View Conversation
                      </button>
                      <button
                        className={cx("tabButton")}
                        onClick={() => setSelectedMeeting({ ...meeting, viewSummary: true })}
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
                <button className={cx("modalActionButton")}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")}>
                  <FaShare />
                </button>
                <button className={cx("modalActionButton")} onClick={() => setSelectedMeeting(null)}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className={cx("modalBody")}>
              <div className={cx("conversationContainer")}>
                {selectedMeeting.messages.map((message) => (
                  <div key={message.id} className={cx("messageItem")}>
                    <div className={cx("messageSender")}>
                      <div className={cx("senderAvatar")}>
                        <BsPersonCircle />
                      </div>
                      <div className={cx("senderInfo")}>
                        <div className={cx("senderName")}>{message.sender}</div>
                        <div className={cx("messageTime")}>{message.time}</div>
                      </div>
                      <div className={cx("messageActions")}>
                        <BsThreeDotsVertical />
                      </div>
                    </div>
                    <div className={cx("messageContent")}>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
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
                <button className={cx("modalActionButton")}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")}>
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

