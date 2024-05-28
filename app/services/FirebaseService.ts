import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { User } from "firebase/auth";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import config from '../../auth/google-services.json';

export class FirebaseService {
    private static instance: FirebaseService;
    private user: User;
    private app: FirebaseApp;

    constructor() {
        this.app = initializeApp({
            apiKey: config.client[0].api_key[0].current_key,
            projectId: config.project_info.project_id,
        });
        if (!this.app) {
            throw new Error('Failed to initialize Firebase App');
        }
        const user = initializeAuth(this.app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        }).currentUser
        if (!user) {
            console.log('no current', user)
            throw new Error('No current user found');
        }
        this.user = user;
    
    }

    public static getInstance(): FirebaseService {
        if (!this.instance) {
            this.instance = new FirebaseService();
        }
        return this.instance;
    }

    public getToken() {
        return this.user.getIdToken();
    }
}