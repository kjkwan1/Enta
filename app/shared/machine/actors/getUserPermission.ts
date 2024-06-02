import { Audio } from "expo-av";
import { fromPromise } from "xstate";

export const getUserPermission = fromPromise(async ({ input }: { input: { hasPermission: boolean }}) => {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  if ((permissionResponse && permissionResponse.status === 'granted') || input.hasPermission) {
    return true;
  }

  const result = await requestPermission();

  if (!result || !result.granted) {
    throw new Error('Permission Denied');
  }

  return true;
  })