import { Audio } from "expo-av";

export interface MachineGlobalContext {
    isRecording: boolean;
    error: unknown;
    recording: Audio.Recording | undefined;
    hasPermission: boolean;
  }
  