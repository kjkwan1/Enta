import { assign, sendTo, setup } from "xstate";

import { startRecording, endRecording } from "@/shared/machine/actors/recording";
import { getUserPermission } from "@/shared/machine/actors/getUserPermission";

import { MachineGlobalContext } from "@/shared/interface/MachineGlobalContext";
import { queueMachine } from "./QueueMachine";

export type AppMachineEvents = { type: "hold_button" }
| { type: "let_go_button" }
| { type: "drag_up" }
| { type: "speak_mic" }
| { type: "let_go" }
| { type: "tap_outside" }
| { type: "hold_button_drag_down" }
| { type: "tap_note" }
| { type: "save" }
| { type: "ai_parsed" }
| { type: "timeout" }
| { type: "hold_button_enter_date_time" }
| { type: "rendering" }

export const machine = setup({
  actors: {
    queueMachine,
    getUserPermission,
    startRecording,
    endRecording,
  },
  types: {
    context: {} as MachineGlobalContext,
    events: {} as AppMachineEvents,
  },
}).createMachine({
  context: {
    queueMachineRef: null,
    isRecording: false,
    error: null,
    recording: undefined,
    hasPermission: false,
    base64Audio: "",
    noteToEnqueue: null,
  },
  guards: {
    beyondThreshold: () => {
      return true;
    },
    noDateTimeDetected: () => {
      return true;
    },
    isAuthenticated: () => {
      return true;
    },
  },
  entry: assign({
    queueMachineRef: ({ spawn }) => spawn('queueMachine', { id: 'queueMachine', syncSnapshot: true })
  }),
  id: "noteApp",
  initial: "home",
  states: {
    home: {
      entry: assign({
          isRecording: false,
      }),
      invoke: [
        {
          id: "getPermission",
          src: "getUserPermission",
          input: ({ context: { hasPermission } }) => ({ hasPermission }),
          onDone: {
            actions: [
              assign({
                hasPermission: true,
              }),
            ],
          },
          onError: {
            target: "home",
          },
        },
      ],
      on: {
        hold_button: {
          guard: ({ context }) => !context.hasPermission,
          target: "buttonHeld",
        },
      },
      description: "Home state where a single button is displayed.",
    },
    buttonHeld: {
      entry: assign({
        isRecording: true,
      }),
      invoke: {
        id: "startRecording",
        src: "startRecording",
        onDone: {
          actions: [
            assign({
              recording: ({ event }) => event.output,
            })
          ],
        },
      },
      on: {
        let_go_button: {
          actions: [
            assign({
              isRecording: false,
            }),
          ],
          target: "buttonLetGo",
        },
        drag_up: {
          target: "draggingUp",
        },
      },
      description: "State when the user holds the button.",
    },
    draggingUp: {
      on: {
        let_go: [
          {
            target: "showingNotes",
          },
          {
            target: "home",
          },
        ],
      },
      description: "State when the user drags the button up.",
    },
    showingNotes: {
      on: {
        tap_outside: {
          target: "home",
        },
        hold_button_drag_down: {
          target: "home",
        },
        tap_note: {
          target: "editingNote",
        },
      },
      description: "State when a list of notes is shown.",
    },
    buttonLetGo: {
      invoke: {
        id: "stopRecording",
        src: "endRecording",
        input: ({ context }) => ({ recording: context.recording }),
        onDone: {
          actions: [
            assign({
              base64Audio: ({ event }) => event.output,
            }),
          ],
          target: "processingSpeech",
        },
        onError: {
          target: "home",
          reenter: true,
          actions: assign({
            error: (context) => console.log(context),
          }),
        },
      },
    },
    processingSpeech: {
      entry: sendTo('queueMachine', ({ context }) => ({ type: 'enqueue', item: { audio: context.base64Audio, uri: context.recording?.getURI()} })),
      on: {
        rendering: {
          target: "home",
        }
      }
    },
    editingNote: {
      on: {
        save: {
          target: "showingNotes",
        },
      },
      description: "State when the user is editing a note.",
    },
  },
});
