const TranscriptionErrorType = [
    'TranscriptionFailed',
    'InvalidTranscriptionMade',
] as const;

export type TranscriptionErrorType = typeof TranscriptionErrorType[number];

const VertexAIErrorType = [
    'InvalidResultFromTranscription',
    'NoResult',
] as const;

export type VertexAIErrorType = typeof VertexAIErrorType[number];

const CommunicationErrorType = [
    'Timeout',
    'General',
] as const;

export type CommunicationErrorType = typeof CommunicationErrorType[number];

export type GoogleCloudErrorType = 
    | TranscriptionErrorType
    | VertexAIErrorType
    | CommunicationErrorType;