import { jest } from "@jest/globals";

const mockService = {
    createMeeting: jest.fn(),
    getMeetings: jest.fn(),
    getMeetingById: jest.fn(),
    getMeetingByCodeMeeting: jest.fn(),
    getMeetingByUser: jest.fn(),
    updateMeeting: jest.fn(),
    deleteMeeting: jest.fn(),
};

jest.unstable_mockModule("../../../src/services/meetingService.js", () => mockService);

const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
} = await import("../../../src/controllers/meetingController.js");

const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Meeting Controller", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("createMeeting", () => {
        it("should create and return 201", async () => {
            const meeting = { id: "1", meetingCode: "ABC" };
            mockService.createMeeting.mockResolvedValue(meeting);

            const req = mockReq({ description: "Test", meetingCode: "ABC" });
            const res = mockRes();
            await createMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(meeting);
        });
    });

    describe("getMeetings", () => {
        it("should return all meetings", async () => {
            const meetings = [{ id: "1" }, { id: "2" }];
            mockService.getMeetings.mockResolvedValue(meetings);

            const req = mockReq();
            const res = mockRes();
            await getMeetings(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(meetings);
        });
    });

    describe("getMeetingById", () => {
        it("should return meeting if found", async () => {
            const meeting = { id: "1" };
            mockService.getMeetingById.mockResolvedValue(meeting);

            const req = mockReq({}, { id: "1" });
            const res = mockRes();
            await getMeetingById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 404 if not found", async () => {
            mockService.getMeetingById.mockResolvedValue(null);

            const req = mockReq({}, { id: "999" });
            const res = mockRes();
            await getMeetingById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("updateMeeting", () => {
        it("should update and return 200", async () => {
            const meeting = { id: "1", description: "Updated" };
            mockService.updateMeeting.mockResolvedValue(meeting);

            const req = mockReq({ description: "Updated" }, { id: "1" });
            const res = mockRes();
            await updateMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(meeting);
        });

        it("should return 404 if not found", async () => {
            mockService.updateMeeting.mockResolvedValue(null);

            const req = mockReq({}, { id: "999" });
            const res = mockRes();
            await updateMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deleteMeeting", () => {
        it("should delete and return success", async () => {
            mockService.deleteMeeting.mockResolvedValue({ id: "1" });

            const req = mockReq({}, { id: "1" });
            const res = mockRes();
            await deleteMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Meeting deleted successfully" });
        });

        it("should return 404 if not found", async () => {
            mockService.deleteMeeting.mockResolvedValue(null);

            const req = mockReq({}, { id: "999" });
            const res = mockRes();
            await deleteMeeting(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
