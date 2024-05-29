import { assign, setup } from "xstate";

import { startRecording, endRecording } from "@/actors/recording";
import { getUserPermission } from "@/actors/getUserPermission";
import { uploadFile } from "@/actors/uploadFile";

import { MachineGlobalContext } from "@/interface/MachineGlobalContext";

export const machine = setup({
  types: {
    context: {} as MachineGlobalContext,
    events: {} as
      | { type: "hold_button" }
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
      | { type: "hold_button_enter_date_time" },
  },
  actors: {
    getUserPermission,
    startRecording,
    endRecording,
    uploadFile,
  },
  guards: { 
    beyondThreshold: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
    noDateTimeDetected: function ({ context, event }) {
      // Add your guard condition here
      return true;
    },
    isAuthenticated: ({context, event}) => {
      return true;
    }
  },
}).createMachine({
  context: {
    isRecording: false,
    error: null,
    recording: undefined,
    hasPermission: false,
    base64Audio: '',
  },
  id: "noteApp",
  initial: "home",
  states: {
    home: {
      invoke: [
        {
          id: 'getPermission',
          src: 'getUserPermission',
          input: ({ context: { hasPermission } }) => ({ hasPermission }),
          onDone: {
            actions: [
              assign({
                hasPermission: true
              }),
            ]
          },
          onError: {
            target: 'home',
          }
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
      invoke: {
          id: 'startRecording',
          src: 'startRecording',
          onDone: {
            actions: [
              assign({
                recording: ({ event }) => event.output
              }),
              ({ event }) => {
                console.log('event: ', event.output);
              },
            ]
          },
      },
      entry: assign({
        isRecording: true,
      }),
      on: {
        let_go_button: {
          actions: [
          assign({
            isRecording: false
          })
        ],
          target: 'buttonLetGo'
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
            guard: {
              type: "beyondThreshold",
            },
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
          id: 'stopRecording',
          src: 'endRecording',
          input: ({ context }) => ({ recording: context.recording }),
          onDone: {
            actions: [
              assign({
                base64Audio: ({ event }) => event.output
              })
            ],
            target: 'processingSpeech',
          },
          onError: {
            target: 'home',
            reenter: true,
            actions: assign({
              error: (context, event) => console.log(context, event),  
            })
          }
      },
    },
    processingSpeech: {
      invoke: {
        id: 'fileUpload',
        src: 'uploadFile',
        input: ({ context }) => ({ base64Audio: context.base64Audio, recording: context.recording })
      },
      on: {
        ai_parsed: [
          {
            target: "promptForDateTime",
            guard: {
              type: "noDateTimeDetected",
            },
          },
          {
            target: "home",
          },
        ],
      },
      description:
        "State when the user’s speech is being sent to AI for parsing.",
    },
    editingNote: {
      on: {
        save: {
          target: "showingNotes",
          actions: ({ context, event }) => console.log("Note saved."),
        },
      },
      description: "State when the user is editing a note.",
    },
    promptForDateTime: {
      on: {
        timeout: {
          target: "home",
        },
        hold_button_enter_date_time: {
          target: "processingSpeech",
          actions: ({ context, event }) => console.log("Date/time entered."),
        },
      },
      after: {
        "5000": {
          target: "home",
          actions: ({ context, event }) =>
            console.log("Timeout, returning home."),
        },
      },
      description:
        "State where an on-screen prompt is shown to specify date/time.",
    },
  },
});

