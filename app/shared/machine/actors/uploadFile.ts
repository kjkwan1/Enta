import { googleCloudService } from "@/shared/services/GoogleCloudService";
import { Audio } from "expo-av";
import { fromPromise } from "xstate";
import { QueueItem } from "../implementation/QueueMachine";

export const uploadFile = fromPromise(async ({ input }: { input: QueueItem }) => {
    if (!input.uri) {
        throw new Error('No recording found!');
    }
    return googleCloudService.upload(input.audio, input.uri);
})
