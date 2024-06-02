import { Audio } from "expo-av";
import { Note } from "./QueueMachine";
import { ActorRef } from "xstate";

export interface MachineGlobalContext {
    queueMachineRef: any;
    isRecording: boolean;
    error: unknown;
    recording: Audio.Recording | undefined;
    hasPermission: boolean;
    base64Audio: string;
    noteToEnqueue: Note | null;
}
  