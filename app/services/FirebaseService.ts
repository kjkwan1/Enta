import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { User } from "firebase/auth";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import config from '../../auth/google-services.json';

export class FirebaseService {
    private static instance: FirebaseService;
    public static isInitialized = false;

    private user!: User;
    private app!: FirebaseApp;

    public async init(): Promise<void> {
        this.app = initializeApp({
            apiKey: config.client[0].api_key[0].current_key,
            appId: config.client[0].client_info.mobilesdk_app_id,
            projectId: config.project_info.project_id,
            authDomain: config.project_info.authDomain,
        });
        console.log('app instance: ', this.app);
        if (!this.app) {
            throw new Error('Failed to initialize Firebase App');
        }
        const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
        const auth = initializeAuth(this.app, { persistence });
        await new Promise((resolve) => {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    resolve(user);
                }
            })
        })
        if (auth.currentUser) {
            this.user = auth.currentUser;
            FirebaseService.isInitialized = true;
        }
    }

    public static getInstance(): FirebaseService {
        if (!this.instance) {
            this.instance = new FirebaseService();
        }
        return this.instance;
    }

    public getToken() {
        return this.user.getIdToken(true);
    }
}