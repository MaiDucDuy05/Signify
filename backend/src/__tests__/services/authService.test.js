import { jest } from "@jest/globals";

// Mock dependencies
const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    password: "$2a$10$hashedpassword",
};

const mockRedis = {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
};

const mockBcrypt = {
    hash: jest.fn().mockResolvedValue("$2a$10$hashedpassword"),
    compare: jest.fn(),
};

const mockJwt = {
    sign: jest.fn().mockReturnValue("mock-token"),
    verify: jest.fn(),
    decode: jest.fn(),
};

const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
};

// Mock modules
jest.unstable_mockModule("bcryptjs", () => ({
    default: mockBcrypt,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: mockJwt,
}));

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
    default: mockRedis,
}));

jest.unstable_mockModule("../../../src/models/User.js", () => ({
    default: mockUserModel,
}));

jest.unstable_mockModule("dotenv", () => ({
    default: { config: jest.fn() },
}));

// Dynamic import after mocking
const { registerUser, loginUser, logoutUser, generateToken } = await import(
    "../../../src/services/authService.js"
);

describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
    });

    describe("registerUser", () => {
        it("should hash password and create user", async () => {
            mockUserModel.create.mockResolvedValue(mockUser);

            const result = await registerUser("Test User", "test@example.com", "password123");

            expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(mockUserModel.create).toHaveBeenCalledWith({
                name: "Test User",
                email: "test@example.com",
                password: "$2a$10$hashedpassword",
            });
            expect(result).toEqual(mockUser);
        });

        it("should throw error if user creation fails", async () => {
            mockUserModel.create.mockRejectedValue(new Error("Email already exists"));

            await expect(
                registerUser("Test", "existing@example.com", "pass")
            ).rejects.toThrow("Email already exists");
        });
    });

    describe("loginUser", () => {
        it("should return user and token on valid credentials", async () => {
            mockUserModel.findOne.mockResolvedValue(mockUser);
            mockBcrypt.compare.mockResolvedValue(true);

            const result = await loginUser("test@example.com", "password123");

            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
            expect(mockBcrypt.compare).toHaveBeenCalledWith("password123", mockUser.password);
            expect(result.user).toEqual(mockUser);
            expect(result.token).toBe("mock-token");
            expect(mockRedis.set).toHaveBeenCalled();
        });

        it("should throw error if user not found", async () => {
            mockUserModel.findOne.mockResolvedValue(null);

            await expect(loginUser("none@example.com", "pass")).rejects.toThrow(
                "Invalid email or password"
            );
        });

        it("should throw error if password does not match", async () => {
            mockUserModel.findOne.mockResolvedValue(mockUser);
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(loginUser("test@example.com", "wrongpass")).rejects.toThrow(
                "Invalid email or password"
            );
        });
    });

    describe("logoutUser", () => {
        it("should blacklist token in Redis with remaining TTL", async () => {
            const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            mockJwt.decode.mockReturnValue({ id: "user-123", exp: futureExp });

            await logoutUser("some-token");

            expect(mockRedis.set).toHaveBeenCalledWith(
                "blacklisted:some-token",
                "true",
                "EX",
                expect.any(Number)
            );
            expect(mockRedis.del).toHaveBeenCalledWith("user:user-123:token");
        });

        it("should handle expired token gracefully", async () => {
            const pastExp = Math.floor(Date.now() / 1000) - 100;
            mockJwt.decode.mockReturnValue({ id: "user-123", exp: pastExp });

            await logoutUser("expired-token");

            // Should not set blacklist for expired token
            expect(mockRedis.set).not.toHaveBeenCalled();
            // Should still delete session
            expect(mockRedis.del).toHaveBeenCalledWith("user:user-123:token");
        });
    });

    describe("generateToken", () => {
        it("should generate JWT with user data", () => {
            generateToken({ id: "user-123", email: "test@example.com" });

            expect(mockJwt.sign).toHaveBeenCalledWith(
                { id: "user-123", email: "test@example.com" },
                "test-secret",
                { expiresIn: "24h" }
            );
        });
    });
});
