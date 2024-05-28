import { useMachine } from "@xstate/react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { machine } from "./machine";
import { createActor } from "xstate";
import { LinearGradient } from "expo-linear-gradient";

import * as colors from '@/style/Variable';

export default function Index() {
  const [state, send, service] = useMachine(machine);
  const countActor = createActor(machine).start();
  countActor.subscribe(() => {
    console.log(`[current state value]: ${service.getSnapshot().value}`);
  });

  return (
    <View
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.midBlue, colors.darkBlue]}
        style={styles.gradientBox}
      >
      {
        state.matches('processingSpeech')
        && <View style={styles.loader}>
          <ActivityIndicator size='large' color={colors.white}/>
        </View>
      }
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onLongPress={() => {
            send({ type: 'hold_button' })
          }}
          onPressOut={() => {
            send({ type: 'let_go_button' })
          }}
        >
        </TouchableOpacity>
      </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    maxHeight: 100,
    marginBottom: 125
  },
  button: {
    width: 200,
    height: 75,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: 100,
    opacity: 0.7,
  },
  gradientBox: {
    height: '100%',
    width: '100%',
    justifyContent: "flex-end",
    alignItems: "center",
    position: 'relative',
    zIndex: 1,
  },
  loader: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    zIndex: 5,
    backgroundColor: colors.black,
    opacity: 0.4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  }
})