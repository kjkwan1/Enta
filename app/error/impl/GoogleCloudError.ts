import { GoogleCloudErrorType } from "../types/GoogleCloudError";

export class GoogleCloudError extends Error {
    public type: GoogleCloudErrorType;

    constructor(message: string, cause?: Error) {
        super(message, cause);
        this.type = 'General';
        Object.setPrototypeOf(this, GoogleCloudError.prototype);
    }
}

export class TranscriptionFailedError extends GoogleCloudError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
        this.type = 'TranscriptionFailed';
        Object.setPrototypeOf(this, TranscriptionFailedError.prototype);
    }
}