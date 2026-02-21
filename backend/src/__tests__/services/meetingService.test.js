import { jest } from "@jest/globals";

// Mock data
const mockMeeting = {
    id: "meeting-123",
    meetingCode: "ABC-DEF-GHI",
    description: "Test Meeting",
    status: "pending",
    date: "2025-03-15",
    time: "10:00",
    duration: 60,
    update: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
};

// Plain version for cache comparisons (JSON.parse strips functions)
const mockMeetingPlain = {
    id: "meeting-123",
    meetingCode: "ABC-DEF-GHI",
    description: "Test Meeting",
    status: "pending",
    date: "2025-03-15",
    time: "10:00",
    duration: 60,
};

const mockRedis = {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
};

const mockMeetingModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
};

const mockMeetingUserModel = {
    create: jest.fn().mockResolvedValue({}),
    destroy: jest.fn().mockResolvedValue(1),
};

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
    default: mockRedis,
}));

jest.unstable_mockModule("../../../src/models/Meeting.js", () => ({
    default: mockMeetingModel,
}));

jest.unstable_mockModule("../../../src/models/MeetingUser.js", () => ({
    default: mockMeetingUserModel,
}));

const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMeetingByCodeMeeting,
} = await import("../../../src/services/meetingService.js");

describe("Meeting Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createMeeting", () => {
        it("should create meeting and add host as MeetingUser", async () => {
            mockMeetingModel.create.mockResolvedValue(mockMeeting);

            const result = await createMeeting({
                host: "user-123",
                description: "Test Meeting",
                meetingCode: "ABC-DEF-GHI",
                date: "2025-03-15",
                time: "10:00",
                duration: 60,
            });

            expect(mockMeetingModel.create).toHaveBeenCalled();
            expect(mockMeetingUserModel.create).toHaveBeenCalledWith({
                userId: "user-123",
                meetingId: "meeting-123",
                role: "host",
            });
            expect(mockRedis.del).toHaveBeenCalledWith("meetings");
            expect(result).toEqual(mockMeeting);
        });
    });

    describe("getMeetings", () => {
        it("should return cached meetings if available", async () => {
            const cached = JSON.stringify([mockMeeting]);
            mockRedis.get.mockResolvedValue(cached);

            const result = await getMeetings();

            expect(mockRedis.get).toHaveBeenCalledWith("meetings");
            expect(result).toEqual([mockMeetingPlain]);
            expect(mockMeetingModel.findAll).not.toHaveBeenCalled();
        });

        it("should query DB and cache when no cache exists", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockMeetingModel.findAll.mockResolvedValue([mockMeeting]);

            const result = await getMeetings();

            expect(mockMeetingModel.findAll).toHaveBeenCalled();
            expect(mockRedis.set).toHaveBeenCalledWith(
                "meetings",
                JSON.stringify([mockMeeting]),
                "EX",
                600
            );
            expect(result).toEqual([mockMeeting]);
        });
    });

    describe("getMeetingById", () => {
        it("should return cached meeting if available", async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify(mockMeeting));

            const result = await getMeetingById("meeting-123");

            expect(result).toEqual(mockMeetingPlain);
            expect(mockMeetingModel.findByPk).not.toHaveBeenCalled();
        });

        it("should return null if meeting not found", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockMeetingModel.findByPk.mockResolvedValue(null);

            const result = await getMeetingById("nonexistent");

            expect(result).toBeNull();
        });

        it("should query DB and cache when no cache exists", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockMeetingModel.findByPk.mockResolvedValue(mockMeeting);

            const result = await getMeetingById("meeting-123");

            expect(result).toEqual(mockMeeting);
            expect(mockRedis.set).toHaveBeenCalledWith(
                "meeting:meeting-123",
                JSON.stringify(mockMeeting),
                "EX",
                300
            );
        });
    });

    describe("updateMeeting", () => {
        it("should update meeting and invalidate caches", async () => {
            mockMeetingModel.findByPk.mockResolvedValue({ ...mockMeeting });

            const result = await updateMeeting("meeting-123", {
                description: "Updated Meeting",
            });

            expect(mockMeeting.update).toHaveBeenCalledWith({
                description: "Updated Meeting",
            });
            expect(mockRedis.del).toHaveBeenCalledWith("meeting:meeting-123");
            expect(mockRedis.del).toHaveBeenCalledWith("meetings");
        });

        it("should return null if meeting not found", async () => {
            mockMeetingModel.findByPk.mockResolvedValue(null);

            const result = await updateMeeting("nonexistent", {});

            expect(result).toBeNull();
        });
    });

    describe("deleteMeeting", () => {
        it("should delete meeting, MeetingUsers, and invalidate caches", async () => {
            mockMeetingModel.findByPk.mockResolvedValue({ ...mockMeeting });

            const result = await deleteMeeting("meeting-123");

            expect(mockMeetingUserModel.destroy).toHaveBeenCalledWith({
                where: { meetingId: "meeting-123" },
            });
            expect(mockMeeting.destroy).toHaveBeenCalled();
            expect(mockRedis.del).toHaveBeenCalledWith("meeting:meeting-123");
            expect(mockRedis.del).toHaveBeenCalledWith("meetings");
        });

        it("should return null if meeting not found", async () => {
            mockMeetingModel.findByPk.mockResolvedValue(null);

            const result = await deleteMeeting("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("getMeetingByCodeMeeting", () => {
        it("should return cached meeting if available", async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify(mockMeeting));

            const result = await getMeetingByCodeMeeting("ABC-DEF-GHI");

            expect(result).toEqual(mockMeetingPlain);
        });

        it("should return null if meeting code not found", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockMeetingModel.findOne.mockResolvedValue(null);

            const result = await getMeetingByCodeMeeting("NONEXISTENT");

            expect(result).toBeNull();
        });
    });
});
