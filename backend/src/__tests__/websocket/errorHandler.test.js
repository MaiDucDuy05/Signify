import { jest } from "@jest/globals";

const { handleError } = await import("../../../src/websocket/errorHandler.js");

describe("WebSocket Error Handler", () => {
    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should send error message to client", () => {
        const ws = { send: jest.fn() };
        const error = new Error("Test error");

        handleError(ws, error, "Something failed");

        expect(ws.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "Something failed" })
        );
    });

    it("should log the error", () => {
        const ws = { send: jest.fn() };
        const error = new Error("Test error");

        handleError(ws, error, "Log this");

        expect(console.error).toHaveBeenCalledWith("Log this:", error);
    });
});
