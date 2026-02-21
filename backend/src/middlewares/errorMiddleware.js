const errorMiddleware = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorMiddleware;
