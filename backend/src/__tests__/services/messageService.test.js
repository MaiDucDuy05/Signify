import { jest } from "@jest/globals";

const mockMessage = {
    id: "msg-123",
    senderId: "user-123",
    meetingId: "meeting-123",
    text: "Hello everyone",
    createdAt: new Date().toISOString(),
};

const mockRedis = {
    rpush: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    lrange: jest.fn().mockResolvedValue([]),
};

const mockMessageModel = {
    create: jest.fn(),
    findAll: jest.fn(),
};

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
    default: mockRedis,
}));

jest.unstable_mockModule("../../../src/models/Message.js", () => ({
    default: mockMessageModel,
}));

const { sendMessage, getMessagesByMeeting } = await import(
    "../../../src/services/messageService.js"
);

describe("Message Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("sendMessage", () => {
        it("should create message and cache in Redis", async () => {
            mockMessageModel.create.mockResolvedValue(mockMessage);

            const result = await sendMessage({
                senderId: "user-123",
                meetingId: "meeting-123",
                text: "Hello everyone",
            });

            expect(mockMessageModel.create).toHaveBeenCalled();
            expect(mockRedis.rpush).toHaveBeenCalledWith(
                "messages:meeting-123",
                JSON.stringify(mockMessage)
            );
            expect(mockRedis.expire).toHaveBeenCalledWith("messages:meeting-123", 3600);
            expect(result).toEqual(mockMessage);
        });
    });

    describe("getMessagesByMeeting", () => {
        it("should return cached messages if available", async () => {
            const cached = [JSON.stringify(mockMessage)];
            mockRedis.lrange.mockResolvedValue(cached);

            const result = await getMessagesByMeeting("meeting-123");

            expect(mockRedis.lrange).toHaveBeenCalledWith("messages:meeting-123", 0, -1);
            expect(result).toEqual([mockMessage]);
            expect(mockMessageModel.findAll).not.toHaveBeenCalled();
        });

        it("should query DB when no cache exists", async () => {
            mockRedis.lrange.mockResolvedValue([]);
            mockMessageModel.findAll.mockResolvedValue([mockMessage]);

            const result = await getMessagesByMeeting("meeting-123");

            expect(mockMessageModel.findAll).toHaveBeenCalledWith({
                where: { meetingId: "meeting-123" },
            });
            expect(mockRedis.rpush).toHaveBeenCalled();
            expect(result).toEqual([mockMessage]);
        });

        it("should return empty array when no messages exist", async () => {
            mockRedis.lrange.mockResolvedValue([]);
            mockMessageModel.findAll.mockResolvedValue([]);

            const result = await getMessagesByMeeting("meeting-123");

            expect(result).toEqual([]);
            expect(mockRedis.rpush).not.toHaveBeenCalled();
        });
    });
});
