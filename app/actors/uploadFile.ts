import { GoogleCloudService } from "@/services/GoogleCloudService";
import { Audio } from "expo-av";
import { fromPromise } from "xstate";

export const uploadFile = fromPromise(async ({ input }: { input: { base64Audio: string; recording: Audio.Recording | undefined } }) => {
    if (!input.recording) {
        throw new Error('No recording found!');
    }
    return GoogleCloudService.getInstance().upload(input.base64Audio, input.recording);
})