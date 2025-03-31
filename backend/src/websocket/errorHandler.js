export function handleError(ws, error, message) {
    console.error(`${message}:`, error);
    ws.send(JSON.stringify({
        type: "error",
        message: message
    }));
}