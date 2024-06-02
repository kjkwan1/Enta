import ConfigurationService from "@/shared/services/ConfigurationService";
import { Audio } from "expo-av";
import { AndroidAudioEncoder, IOSOutputFormat, RecordingOptionsPresets } from "expo-av/build/Audio";
import * as FileSystem from "expo-file-system";
import { FFmpegKit, FFmpegKitConfig, FFprobeKit, ReturnCode } from 'ffmpeg-kit-react-native';

import { fromPromise } from "xstate";

export const startRecording = fromPromise(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true,
    });
  
    const recording = new Audio.Recording();
    try {
      const configs = {
        ...RecordingOptionsPresets.LOW_QUALITY,
        ios: {
          ...RecordingOptionsPresets.LOW_QUALITY.ios,
          outputFormat: IOSOutputFormat.AMR_WB,
          sampleRate: 16000
        },
        android: {
          ...RecordingOptionsPresets.LOW_QUALITY.android,
          audioEncoder: AndroidAudioEncoder.AMR_WB,
          sampleRate: 16000
        }
      };

      await recording.prepareToRecordAsync(configs);
      await recording.startAsync();
    } catch (error) {
      console.log('Error', error);
    }

    return recording;
});

export const endRecording = fromPromise(async ({ input }: { input: { recording: Audio.Recording | undefined } }) => {
    const { recording } = input;

    if (!recording) {
      console.log('no recording found');
      throw new Error('Recording not found, cannot end');
    }

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    if (!uri) {
      console.log('no URI', uri);
      throw new Error('no uri found');
    }

    return getLinear16Base64(uri);
});

const getLinear16Base64 = async (uri: string) => {
  const outPath = `${FileSystem.cacheDirectory}output.wav`;
  const cmd = `-y -i ${uri} -acodec pcm_s16le -ar 16000 -ac 1 ${outPath}`;

  let base64Data: string = '';
  try {
    const session = await FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      if (ConfigurationService.isMobile()) {
        base64Data = await FileSystem.readAsStringAsync(outPath, { encoding: FileSystem.EncodingType.Base64 });
      } else {
        const blob = await fetch(uri).then((body) => body.blob());
        const reader = new FileReader();
        reader.readAsDataURL(blob as Blob);
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          }
        });
      }
    } else {
      throw new Error('FFmpegKit failed to execute command');
    }
  } catch(error) {
    console.log('Failed to convert to linear 16 format base64', error);
    throw error;
  }

  if (!base64Data) {
    throw new Error('Failed to convert to linear 16 format base64');
  }
  
  return base64Data;
}