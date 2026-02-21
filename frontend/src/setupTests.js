// Polyfills for react-router v7 in JSDOM environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Minimal polyfills for web APIs used by react-router v7
if (typeof global.Request === 'undefined') {
    global.Request = class Request {
        constructor(input, init) { this.url = input; this.method = init?.method || 'GET'; }
    };
}
if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init) { this.body = body; this.status = init?.status || 200; }
        async text() { return '' }
    };
}
if (typeof global.ReadableStream === 'undefined') {
    const { ReadableStream } = require('stream/web');
    global.ReadableStream = ReadableStream;
}

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
