import { jest } from "@jest/globals";

const mockUser = { id: "user-1", name: "TestUser", email: "test@test.com" };

const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
};

const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
};

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
    default: mockRedis,
}));

jest.unstable_mockModule("../../../src/models/User.js", () => ({
    default: mockUserModel,
}));

const { createUser, getUsers, getUserById, getUserByUsername } = await import(
    "../../../src/services/userService.js"
);

describe("User Service", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("createUser", () => {
        it("should create user, invalidate cache, and set user cache", async () => {
            mockUserModel.create.mockResolvedValue(mockUser);

            const result = await createUser({ name: "TestUser", email: "test@test.com" });

            expect(mockUserModel.create).toHaveBeenCalled();
            expect(mockRedis.del).toHaveBeenCalledWith("users");
            expect(mockRedis.set).toHaveBeenCalledWith(`user:${mockUser.id}`, JSON.stringify(mockUser));
            expect(result).toEqual(mockUser);
        });
    });

    describe("getUsers", () => {
        it("should return cached users if available", async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify([mockUser]));

            const result = await getUsers();

            expect(result).toEqual([mockUser]);
            expect(mockUserModel.findAll).not.toHaveBeenCalled();
        });

        it("should query DB and cache when no cache exists", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockUserModel.findAll.mockResolvedValue([mockUser]);

            const result = await getUsers();

            expect(mockUserModel.findAll).toHaveBeenCalled();
            expect(mockRedis.set).toHaveBeenCalledWith("users", JSON.stringify([mockUser]), "EX", 3600);
            expect(result).toEqual([mockUser]);
        });
    });

    describe("getUserById", () => {
        it("should return cached user if available", async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify(mockUser));

            const result = await getUserById("user-1");

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findByPk).not.toHaveBeenCalled();
        });

        it("should query DB and cache when not cached", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockUserModel.findByPk.mockResolvedValue(mockUser);

            const result = await getUserById("user-1");

            expect(result).toEqual(mockUser);
            expect(mockRedis.set).toHaveBeenCalledWith("user:user-1", JSON.stringify(mockUser));
        });

        it("should return null if user not found", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockUserModel.findByPk.mockResolvedValue(null);

            const result = await getUserById("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("getUserByUsername", () => {
        it("should return cached user by username", async () => {
            mockRedis.get.mockResolvedValue(JSON.stringify(mockUser));

            const result = await getUserByUsername("TestUser");

            expect(mockRedis.get).toHaveBeenCalledWith("user:TestUser:name");
            expect(result).toEqual(mockUser);
        });

        it("should query DB and cache when not cached", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockUserModel.findOne.mockResolvedValue(mockUser);

            const result = await getUserByUsername("TestUser");

            expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { name: "TestUser" } });
            expect(mockRedis.set).toHaveBeenCalledWith("user:TestUser:name", JSON.stringify(mockUser));
            expect(result).toEqual(mockUser);
        });

        it("should return null if user not found", async () => {
            mockRedis.get.mockResolvedValue(null);
            mockUserModel.findOne.mockResolvedValue(null);

            const result = await getUserByUsername("Nobody");

            expect(result).toBeNull();
        });
    });
});
