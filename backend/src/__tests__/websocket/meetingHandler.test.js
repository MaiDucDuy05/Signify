import { jest } from "@jest/globals";
import WebSocket from "ws";

// Mock dependencies
const mockUpdateMeetingStatus = jest.fn();
const mockAddUserToMeeting = jest.fn();
const mockUpdateUserLeaveMeeting = jest.fn();
const mockSendMessage = jest.fn();
const mockGetUserByUsername = jest.fn();
const mockGetMeetingByCodeMeeting = jest.fn();

jest.unstable_mockModule("../../../src/services/meetingService.js", () => ({
    updateMeetingStatus: mockUpdateMeetingStatus,
    getMeetingByCodeMeeting: mockGetMeetingByCodeMeeting,
}));

jest.unstable_mockModule("../../../src/services/meetingUserService.js", () => ({
    addUserToMeeting: mockAddUserToMeeting,
    updateUserLeaveMeeting: mockUpdateUserLeaveMeeting,
}));

jest.unstable_mockModule("../../../src/services/messageService.js", () => ({
    sendMessage: mockSendMessage,
}));

jest.unstable_mockModule("../../../src/services/userService.js", () => ({
    getUserByUsername: mockGetUserByUsername,
}));

const {
    broadcastToMeeting,
    handleJoinMeeting,
    handleleaveMeeting,
    handleWebRTCSignaling,
    handleChatMessage,
} = await import("../../../src/websocket/meetingHandler.js");

// Helper to create a mock WebSocket
const createMockWs = () => ({
    send: jest.fn(),
    readyState: WebSocket.OPEN,
});

describe("WebSocket Meeting Handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe("broadcastToMeeting", () => {
        it("should send message to all participants except excluded", () => {
            const meetings = new Map();
            const ws1 = createMockWs();
            const ws2 = createMockWs();
            const ws3 = createMockWs();
            meetings.set("room-1", new Map([["Alice", ws1], ["Bob", ws2], ["Charlie", ws3]]));

            broadcastToMeeting(meetings, "room-1", { type: "test" }, ws1);

            expect(ws1.send).not.toHaveBeenCalled();
            expect(ws2.send).toHaveBeenCalledWith(JSON.stringify({ type: "test" }));
            expect(ws3.send).toHaveBeenCalledWith(JSON.stringify({ type: "test" }));
        });

        it("should not send to closed connections", () => {
            const meetings = new Map();
            const wsOpen = createMockWs();
            const wsClosed = { send: jest.fn(), readyState: WebSocket.CLOSED };
            meetings.set("room-1", new Map([["Alice", wsOpen], ["Bob", wsClosed]]));

            broadcastToMeeting(meetings, "room-1", { type: "test" });

            expect(wsOpen.send).toHaveBeenCalled();
            expect(wsClosed.send).not.toHaveBeenCalled();
        });

        it("should do nothing if meeting does not exist", () => {
            const meetings = new Map();
            broadcastToMeeting(meetings, "nonexistent", { type: "test" });
            // No error thrown
        });
    });

    describe("handleJoinMeeting", () => {
        it("should add user to meeting and broadcast", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            mockGetUserByUsername.mockResolvedValue({ id: "user-1" });
            mockGetMeetingByCodeMeeting.mockResolvedValue({ id: "mtg-1", status: "pending" });

            await handleJoinMeeting(clients, meetings, ws, {
                username: "Alice",
                meetingCode: "ROOM-1",
            });

            expect(meetings.get("ROOM-1").has("Alice")).toBe(true);
            expect(clients.get(ws)).toEqual({ username: "Alice", meetingCode: "ROOM-1" });
            expect(mockUpdateMeetingStatus).toHaveBeenCalledWith("ROOM-1", "ongoing");
            expect(mockAddUserToMeeting).toHaveBeenCalledWith("user-1", "mtg-1");
            // ws.send should be called with meeting-info
            expect(ws.send).toHaveBeenCalledWith(
                expect.stringContaining("meeting-info")
            );
        });

        it("should not add duplicate user", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws1 = createMockWs();
            const ws2 = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", ws1]]));

            await handleJoinMeeting(clients, meetings, ws2, {
                username: "Alice",
                meetingCode: "ROOM-1",
            });

            // Should not overwrite existing ws
            expect(meetings.get("ROOM-1").get("Alice")).toBe(ws1);
        });
    });

    describe("handleleaveMeeting", () => {
        it("should remove user and broadcast user-left", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();
            const ws2 = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", ws], ["Bob", ws2]]));
            clients.set(ws, { username: "Alice", meetingCode: "ROOM-1" });

            await handleleaveMeeting(clients, meetings, ws);

            expect(meetings.get("ROOM-1").has("Alice")).toBe(false);
            expect(clients.has(ws)).toBe(false);
            expect(ws2.send).toHaveBeenCalledWith(
                expect.stringContaining("user-left")
            );
        });

        it("should set status to 'ended' when last user leaves", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", ws]]));
            clients.set(ws, { username: "Alice", meetingCode: "ROOM-1" });

            await handleleaveMeeting(clients, meetings, ws);

            expect(mockUpdateMeetingStatus).toHaveBeenCalledWith("ROOM-1", "ended");
            expect(meetings.has("ROOM-1")).toBe(false);
        });

        it("should do nothing if client is not tracked", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            await handleleaveMeeting(clients, meetings, ws);
            // No error thrown
        });
    });

    describe("handleWebRTCSignaling", () => {
        it("should forward signaling to target user", () => {
            const clients = new Map();
            const meetings = new Map();
            const wsSender = createMockWs();
            const wsTarget = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", wsSender], ["Bob", wsTarget]]));
            clients.set(wsSender, { username: "Alice", meetingCode: "ROOM-1" });

            handleWebRTCSignaling(clients, meetings, wsSender, {
                type: "offer",
                target: "Bob",
                sdp: "mock-sdp",
            });

            expect(wsTarget.send).toHaveBeenCalledWith(
                JSON.stringify({ type: "offer", target: "Bob", sdp: "mock-sdp", from: "Alice" })
            );
        });

        it("should do nothing if client is not tracked", () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            handleWebRTCSignaling(clients, meetings, ws, { type: "offer", target: "Bob" });
            // No error thrown
        });

        it("should do nothing if target user not found", () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", ws]]));
            clients.set(ws, { username: "Alice", meetingCode: "ROOM-1" });

            handleWebRTCSignaling(clients, meetings, ws, { type: "offer", target: "Nobody" });
            // No error thrown
        });
    });

    describe("handleChatMessage", () => {
        it("should broadcast and persist message", async () => {
            const clients = new Map();
            const meetings = new Map();
            const wsSender = createMockWs();
            const wsOther = createMockWs();

            meetings.set("ROOM-1", new Map([["Alice", wsSender], ["Bob", wsOther]]));
            clients.set(wsSender, { username: "Alice", meetingCode: "ROOM-1" });

            mockGetUserByUsername.mockResolvedValue({ id: "user-1" });
            mockGetMeetingByCodeMeeting.mockResolvedValue({ id: "mtg-1" });

            await handleChatMessage(clients, meetings, wsSender, { message: "Hello!" });

            // Should broadcast to other participants
            expect(wsOther.send).toHaveBeenCalledWith(
                expect.stringContaining("chat-message")
            );
            // Should persist message
            expect(mockSendMessage).toHaveBeenCalledWith({
                senderId: "user-1",
                meetingId: "mtg-1",
                text: "Hello!",
            });
        });

        it("should do nothing if client is not tracked", async () => {
            const clients = new Map();
            const meetings = new Map();
            const ws = createMockWs();

            await handleChatMessage(clients, meetings, ws, { message: "Hello!" });

            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });
});
