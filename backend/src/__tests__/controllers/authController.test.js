import { jest } from "@jest/globals";

// Mock the service functions
const mockRegisterUser = jest.fn();
const mockLoginUser = jest.fn();
const mockLogoutUser = jest.fn();

jest.unstable_mockModule("../../../src/services/authService.js", () => ({
    registerUser: mockRegisterUser,
    loginUser: mockLoginUser,
    logoutUser: mockLogoutUser,
}));

const { register, login, logout } = await import(
    "../../../src/controllers/authController.js"
);

// Helper to create mock req/res
const mockReq = (body = {}, headers = {}) => ({
    body,
    header: jest.fn((name) => headers[name]),
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Auth Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("register", () => {
        it("should register user and return 201", async () => {
            const user = { id: "1", name: "Test", email: "test@test.com" };
            mockRegisterUser.mockResolvedValue(user);

            const req = mockReq({ name: "Test", email: "test@test.com", password: "pass" });
            const res = mockRes();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "User registered successfully",
                user,
            });
        });

        it("should return 500 on registration error", async () => {
            mockRegisterUser.mockRejectedValue(new Error("Duplicate email"));

            const req = mockReq({ name: "Test", email: "dup@test.com", password: "pass" });
            const res = mockRes();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Duplicate email" });
        });
    });

    describe("login", () => {
        it("should return user and token on success", async () => {
            const loginResult = { user: { id: "1" }, token: "jwt-token" };
            mockLoginUser.mockResolvedValue(loginResult);

            const req = mockReq({ email: "test@test.com", password: "pass" });
            const res = mockRes();

            await login(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: "Login successful",
                ...loginResult,
            });
        });

        it("should return 401 on invalid credentials", async () => {
            mockLoginUser.mockRejectedValue(new Error("Invalid email or password"));

            const req = mockReq({ email: "test@test.com", password: "wrong" });
            const res = mockRes();

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe("logout", () => {
        it("should logout and return success message", async () => {
            mockLogoutUser.mockResolvedValue();

            const req = mockReq({}, { Authorization: "Bearer some-token" });
            const res = mockRes();

            await logout(req, res);

            expect(mockLogoutUser).toHaveBeenCalledWith("some-token");
            expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
        });

        it("should return 500 on logout error", async () => {
            mockLogoutUser.mockRejectedValue(new Error("Redis error"));

            const req = mockReq({}, { Authorization: "Bearer bad-token" });
            const res = mockRes();

            await logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
