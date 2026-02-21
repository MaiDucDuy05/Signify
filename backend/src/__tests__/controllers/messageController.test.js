import { jest } from "@jest/globals";

const mockService = {
    sendMessage: jest.fn(),
    getMessagesByMeeting: jest.fn(),
};

jest.unstable_mockModule("../../../src/services/messageService.js", () => mockService);

const { sendMessage, getMessagesByMeeting } = await import(
    "../../../src/controllers/messageController.js"
);

const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Message Controller", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("sendMessage", () => {
        it("should send message and return 201", async () => {
            const message = { id: "1", text: "Hello" };
            mockService.sendMessage.mockResolvedValue(message);

            const req = mockReq({ senderId: "user-1", meetingId: "mtg-1", text: "Hello" });
            const res = mockRes();
            await sendMessage(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(message);
        });

        it("should return 500 on error", async () => {
            mockService.sendMessage.mockRejectedValue(new Error("DB error"));

            const req = mockReq({ text: "Hello" });
            const res = mockRes();
            await sendMessage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getMessagesByMeeting", () => {
        it("should return messages for meeting", async () => {
            const messages = [{ id: "1", text: "Hi" }];
            mockService.getMessagesByMeeting.mockResolvedValue(messages);

            const req = mockReq({}, { meetingId: "mtg-1" });
            const res = mockRes();
            await getMessagesByMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(messages);
        });

        it("should return 500 on error", async () => {
            mockService.getMessagesByMeeting.mockRejectedValue(new Error("DB error"));

            const req = mockReq({}, { meetingId: "mtg-1" });
            const res = mockRes();
            await getMessagesByMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
