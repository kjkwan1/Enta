import { Audio } from "expo-av";
import { fromPromise } from "xstate";

export const startRecording = fromPromise(async () => {
    console.log('start recording');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  
    const recording = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    console.log('recording started: ', recording);
    return recording.recording;
});

export const endRecording = fromPromise(async ({ input }: { input: { recording: Audio.Recording | undefined } }) => {
    console.log('input: ', input);
    const { recording } = input;
    if (!recording) {
      console.log('no recording found');
      throw new Error('Recording not found, cannot end');
    }
    console.log('stopping recording: ', recording);
    const res = await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    return recording.getURI();
});
  