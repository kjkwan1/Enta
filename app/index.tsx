import { useActor, useActorRef, useMachine } from "@xstate/react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { machine } from "./shared/machine/implementation/AppMachine";
import { LinearGradient } from "expo-linear-gradient";

import * as colors from '@/style/Variable';
import { createActor } from "xstate";

export default function Index() {
  const [state, send, service] = useMachine(machine);

  const actor = createActor(machine);
  actor.start();

  actor.subscribe((snapshot) => {
    const ref = service.getSnapshot().context.queueMachineRef;
    const update = ref.getSnapshot().context.update;
    if (update) {
      console.log('has update!', update);
    }
  })

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.midBlue, colors.darkBlue]} style={styles.gradientBox}>
      {
        state.matches('processingSpeech') 
          && <View style={styles.loader}>
            <ActivityIndicator size='large' color={colors.white}/>
          </View>
      }
      <View style={styles.listContainer}>
        <Text style={{ color: colors.white, fontSize: 16 }}>Recent</Text>
        <ScrollView>
          
        </ScrollView>
      </View>
        
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
    marginBottom: 125,
    minHeight: 75
  },
  button: {
    width: 200,
    height: 75,
    minHeight: 75,
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
  },
  listContainer: {
    position: 'relative',
    zIndex: 3,
    color: colors.white,
    fontSize: 16
  }
})