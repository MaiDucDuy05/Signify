import { jest } from "@jest/globals";

// Import directly since errorMiddleware has no external deps to mock
const { default: errorMiddleware } = await import(
    "../../../src/middlewares/errorMiddleware.js"
);

const mockReq = {};
const mockNext = jest.fn();

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Error Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error output in tests
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should return 500 and error message for generic errors", () => {
        const err = new Error("Something went wrong");
        const res = mockRes();

        errorMiddleware(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Something went wrong" })
        );
    });

    it("should use custom statusCode if provided", () => {
        const err = new Error("Not Found");
        err.statusCode = 404;
        const res = mockRes();

        errorMiddleware(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Not Found" })
        );
    });

    it("should include stack trace in non-production env", () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        const err = new Error("Dev error");
        const res = mockRes();

        errorMiddleware(err, mockReq, res, mockNext);

        const jsonCall = res.json.mock.calls[0][0];
        expect(jsonCall.stack).toBeDefined();

        process.env.NODE_ENV = originalEnv;
    });

    it("should NOT include stack trace in production env", () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        const err = new Error("Prod error");
        const res = mockRes();

        errorMiddleware(err, mockReq, res, mockNext);

        const jsonCall = res.json.mock.calls[0][0];
        expect(jsonCall.stack).toBeUndefined();

        process.env.NODE_ENV = originalEnv;
    });

    it("should handle errors without message", () => {
        const err = {};
        const res = mockRes();

        errorMiddleware(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Internal Server Error" })
        );
    });
});
