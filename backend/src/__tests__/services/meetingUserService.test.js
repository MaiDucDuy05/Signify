import { jest } from "@jest/globals";

const mockMeetingUserModel = {
    findOrCreate: jest.fn(),
    update: jest.fn(),
};

const mockGetUserByUsername = jest.fn();
const mockGetMeetingByCodeMeeting = jest.fn();

jest.unstable_mockModule("../../../src/models/MeetingUser.js", () => ({
    default: mockMeetingUserModel,
}));

jest.unstable_mockModule("../../../src/services/userService.js", () => ({
    getUserByUsername: mockGetUserByUsername,
}));

jest.unstable_mockModule("../../../src/services/meetingService.js", () => ({
    getMeetingByCodeMeeting: mockGetMeetingByCodeMeeting,
}));

const { addUserToMeeting, updateUserLeaveMeeting } = await import(
    "../../../src/services/meetingUserService.js"
);

describe("MeetingUser Service", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("addUserToMeeting", () => {
        it("should find or create MeetingUser record", async () => {
            mockMeetingUserModel.findOrCreate.mockResolvedValue([{}, true]);

            await addUserToMeeting("user-1", "meeting-1");

            expect(mockMeetingUserModel.findOrCreate).toHaveBeenCalledWith({
                where: { userId: "user-1", meetingId: "meeting-1" },
                defaults: { joinedAt: expect.any(Date) },
            });
        });

        it("should throw on error", async () => {
            mockMeetingUserModel.findOrCreate.mockRejectedValue(new Error("DB error"));

            await expect(addUserToMeeting("user-1", "meeting-1")).rejects.toThrow("DB error");
        });
    });

    describe("updateUserLeaveMeeting", () => {
        it("should update leavedAt for the user", async () => {
            mockGetUserByUsername.mockResolvedValue({ id: "user-1" });
            mockGetMeetingByCodeMeeting.mockResolvedValue({ id: "meeting-1" });
            mockMeetingUserModel.update.mockResolvedValue([1]);

            await updateUserLeaveMeeting("TestUser", "ABC-DEF");

            expect(mockGetUserByUsername).toHaveBeenCalledWith("TestUser");
            expect(mockGetMeetingByCodeMeeting).toHaveBeenCalledWith("ABC-DEF");
            expect(mockMeetingUserModel.update).toHaveBeenCalledWith(
                { leavedAt: expect.any(Date) },
                { where: { userId: "user-1", meetingId: "meeting-1" } }
            );
        });

        it("should throw if meeting not found", async () => {
            mockGetUserByUsername.mockResolvedValue({ id: "user-1" });
            mockGetMeetingByCodeMeeting.mockResolvedValue(null);

            await expect(updateUserLeaveMeeting("TestUser", "NONEXIST")).rejects.toThrow(
                "Meeting not found"
            );
        });
    });
});
