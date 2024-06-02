export interface Note {
    id: string;
    date: string;
    time: string;
    repeat: boolean;
    note: string;
    error: unknown;
    dateParsed: boolean;
}