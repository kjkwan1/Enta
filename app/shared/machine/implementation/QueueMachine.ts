import { Note } from "@/shared/interface/QueueMachine";
import { uploadFile } from "@/shared/machine/actors/uploadFile";

import { MachineContext, assign, fromCallback, fromPromise, sendParent, setup } from "xstate";

export interface QueueMachineContext extends MachineContext {
    queue: QueueItem[];
    update: Note | null;
}

export interface QueueItem {
  uri: string | null;
  audio: string;
}

export interface EnqueueEvent {
    type: 'enqueue';
    item: QueueItem;
}

export type QueueMachineEvents = EnqueueEvent | UpdateEvent | { type: 'view_rendered'};

interface UpdateEvent {
  type: 'update',
  note: Note;
}

export const queueMachine = setup({
  types: {
    context: {} as QueueMachineContext,
    events: {} as QueueMachineEvents,
  },
  actions: {
      enqueue: assign({
          queue: ({ context, event }) => {
            event = event as EnqueueEvent;
            return [...context.queue, event.item];
          }
      }),
      update: assign({
        queue: ({ context }) => context.queue.slice(1),
        update: ({ event }) => (event as UpdateEvent).note,
      })
  },
  actors: {
    uploadFile,
  }
}).createMachine({
    id: 'queue',
    initial: 'idle',
    context: {
      queue: [],
      update: null,
    },
    states: {
      idle: {
        on: {
          enqueue: {
            actions: 'enqueue',
            target: 'processing',
          },
        },
      },
      processing: {
        invoke: {
          id: 'uploadFile',
          src: 'uploadFile',
          input: ({ context }) => (context.queue[0]),
          onDone: {
            actions: [
              assign({
                queue: ({ context }) => context.queue.slice(1),
                update: ({ event }) => event.output,
              }),
              sendParent({ type: 'rendering' })
            ],
            target: 'rendering'
          }
        },
      },
      rendering: {
        on: {
          view_rendered: {
            actions: assign({
              update: null
            }),
            target:'idle'
          }
        }
      }
    },
  });