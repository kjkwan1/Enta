// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Note } from "../interface/QueueMachine";

// class DatabaseServiceMock {
//     private static instance: DatabaseServiceMock;

//     private constructor() {}

//     public static getInstance(): DatabaseServiceMock {
//       if (!DatabaseServiceMock.instance) {
//         DatabaseServiceMock.instance = new DatabaseServiceMock();
//       }
//       return DatabaseServiceMock.instance;
//     }

//     public async read(id: string): Promise<Note> {
//         const note = await AsyncStorage.getItem(id);
//         if (!note) {
//             throw new Error(`No note found with id ${id}`);
//         }
//         return JSON.parse(note);
//     }

//     public async readAll(): Promise<Note[]> {
        
//     }

//     public write(note: Note) {
//         return AsyncStorage.setItem(note.id, JSON.stringify(note));
//     }
// }