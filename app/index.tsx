import { useMachine } from "@xstate/react";
import {
  View,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import { machine } from "./machine";
import { createActor } from "xstate";

export default function Index() {
  const [current, send] = useMachine(machine);
  const countActor = createActor(machine).start();
  countActor.subscribe((snapshot) => {
    console.log(snapshot);
  });

  console.log(current);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <View style={{
        height: 100,
        width: 100,
      }}>

      <TouchableOpacity 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPressIn={() => {
          console.log('pressed in');
          send({ type: 'hold_button' })
        }}
        onPressOut={() => {
          console.log('pressed out');
          send({ type: 'let_go_button' })
        }}
      >
        <Text style={{}}>Press This</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}
