import { Audio } from 'expo-av';
import { firebaseService } from './FirebaseService';
import { Note } from '@/shared/interface/QueueMachine';
import { TranscriptionFailedError } from '@/error/impl/GoogleCloudError';

class GoogleCloudService {
    private static instance: GoogleCloudService;
    readonly gcloudFunctionUrl = 'https://us-central1-enta-424515.cloudfunctions.net/transcribe';
    readonly vertexFunctionUrl = 'https://us-central1-enta-424515.cloudfunctions.net/parse';
    constructor() {
    }

    public static getInstance(): GoogleCloudService {
        if (!this.instance) {
            this.instance = new GoogleCloudService();
        }
        return this.instance;
    }

    public async upload(base64Audio: string, uri: string) {
        if (!firebaseService.isInitialized) {
            await firebaseService.init();
        }

        if (!uri) {
            throw new Error('No valid URI found');
        }

        const token = await firebaseService.getToken();
        if (!token) {
            throw new Error('Failed to fetch token');
        }

        const request = await this.buildTranscriptionRequest(
            this.gcloudFunctionUrl,
            base64Audio,
            'POST',
            token
        );
        const fetchResult = await fetch(request);
        if (!fetchResult.status) {
            throw new TranscriptionFailedError('Bad result received');
        }

        const result = await fetchResult.json();
        const transcript = result.transcript
        if (!transcript) {
            throw new TranscriptionFailedError('No valid transcript parsed');
        }
        
        const note = await this.uploadToVertex(transcript);

        return note;
    }

    public async uploadToVertex(transcript: string): Promise<Note> {
        const token = await firebaseService.getToken();
        if (!token) {
            throw new Error('Failed to fetch token');
        }

        const request = this.buildVertexRequest(
            this.vertexFunctionUrl,
            transcript,
            token
        );

        const fetchResult = await fetch(request);
        if (!fetchResult.status) {
            throw new Error(`Upload error, failed request with ${fetchResult}`);
        }

        const result = await fetchResult.json();
        return result as Note;
    }

    private async buildTranscriptionRequest(
        url: string,
        base64Audio: string,
        method: string,
        token: string
    ): Promise<Request> {
        const headers = this.makeJsonHeaders(token);
        const requestBody = {
            base64Audio,
            sampleRate: 16000,
            encoding: 'LINEAR16'
        };
        const request = new Request(url, {
            body: JSON.stringify(requestBody),
            headers,
            method,
        });

        return request;
    }

    private buildVertexRequest(url: string, transcript: string, token: string): Request {
        const headers = this.makeJsonHeaders(token);
        return new Request(url, {
            body: JSON.stringify({ transcription: transcript }),
            headers,
            method: 'POST',
        });
    }

    private makeJsonHeaders(token: string): Headers {
        return new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }
}

export const googleCloudService = GoogleCloudService.getInstance();