import { Audio } from 'expo-av';
import { FirebaseService } from './FirebaseService';

export class GoogleCloudService {
    private static instance: GoogleCloudService;
    readonly gcloudFunctionUrl = 'https://us-central1-enta-424515.cloudfunctions.net/transcribe';
    constructor() {
    }

    public static getInstance(): GoogleCloudService {
        if (!this.instance) {
            this.instance = new GoogleCloudService();
        }
        return this.instance;
    }

    public async upload(base64Audio: string, recording: Audio.Recording) {
        if (!FirebaseService.isInitialized) {
            await FirebaseService.getInstance().init();
        }
        const uri = recording.getURI();
        if (!uri) {
            throw new Error('No valid URI found');
        }

        const request = await this.buildRequest(
            `${this.gcloudFunctionUrl}/`,
            base64Audio,
            'POST'
        );

        console.log('request built: ', request);
        const result = await fetch(request);

        if (!result.ok) {
            throw new Error(`Upload error, failed request with ${result.body}`);
        }

        console.log('result from endpoint: ', result);
        return result;
    }

    private async buildRequest(
        url: string,
        base64Audio: string,
        method: string
    ): Promise<Request> {
        const token = await FirebaseService.getInstance().getToken();
        if (!token) {
            throw new Error('Failed to fetch token');
        }

        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        const request = new Request(url, {
            body: base64Audio,
            headers,
            method,
        });

        return request;
    }
}