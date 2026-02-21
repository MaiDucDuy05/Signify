import { jest } from "@jest/globals";

const mockRedis = {
    get: jest.fn(),
};

const mockJwt = {
    verify: jest.fn(),
};

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
    default: mockRedis,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: mockJwt,
}));

jest.unstable_mockModule("dotenv", () => ({
    default: { config: jest.fn() },
}));

const { authenticate } = await import("../../../middlewares/authMiddleware.js");

const mockReq = (headers = {}) => ({
    header: jest.fn((name) => headers[name]),
    user: null,
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe("Auth Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
    });

    it("should return 401 if no Authorization header", async () => {
        const req = mockReq({});
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized: No token provided",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if Authorization header does not start with Bearer", async () => {
        const req = mockReq({ Authorization: "Basic some-token" });
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is blacklisted", async () => {
        mockRedis.get.mockResolvedValue("true");

        const req = mockReq({ Authorization: "Bearer blacklisted-token" });
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(mockRedis.get).toHaveBeenCalledWith("blacklisted:blacklisted-token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized: Token has been revoked",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() and set req.user on valid, non-blacklisted token", async () => {
        mockRedis.get.mockResolvedValue(null);
        const decoded = { id: "user-123", email: "test@test.com" };
        mockJwt.verify.mockReturnValue(decoded);

        const req = mockReq({ Authorization: "Bearer valid-token" });
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(mockJwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
        expect(req.user).toEqual(decoded);
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 with expired message on TokenExpiredError", async () => {
        mockRedis.get.mockResolvedValue(null);
        const expiredError = new Error("jwt expired");
        expiredError.name = "TokenExpiredError";
        mockJwt.verify.mockImplementation(() => { throw expiredError; });

        const req = mockReq({ Authorization: "Bearer expired-token" });
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized: Token has expired",
        });
    });

    it("should return 401 with generic message on invalid token", async () => {
        mockRedis.get.mockResolvedValue(null);
        mockJwt.verify.mockImplementation(() => { throw new Error("invalid signature"); });

        const req = mockReq({ Authorization: "Bearer bad-token" });
        const res = mockRes();

        await authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized: Invalid token",
        });
    });
});
