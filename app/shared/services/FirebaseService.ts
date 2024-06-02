import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from "firebase/auth";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import config from '../../../auth/google-services.json';

class FirebaseService {
    private static instance: FirebaseService;
    private _isInitialized = false;

    get isInitialized() {
        return this._isInitialized;
    }

    set isInitialized(value: boolean) {
        this._isInitialized = value;
    }

    private user!: User;
    private app!: FirebaseApp;

    public async init(): Promise<void> {
        this.app = initializeApp({
            apiKey: config.client[0].api_key[0].current_key,
            appId: config.client[0].client_info.mobilesdk_app_id,
            projectId: config.project_info.project_id,
            authDomain: config.project_info.authDomain,
        });
        if (!this.app) {
            throw new Error('Failed to initialize Firebase App');
        }
        const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
        const auth = initializeAuth(this.app, { persistence });
        const userCred = await signInWithEmailAndPassword(auth, "123", "123");

        this.user = userCred.user;
        this.isInitialized = true
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

export const firebaseService = FirebaseService.getInstance();