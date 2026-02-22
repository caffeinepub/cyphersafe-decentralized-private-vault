import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Note {
    title: string;
    selfDestructAt?: bigint;
    content: string;
    createdAt: bigint;
    lastModified: bigint;
}
export interface PersistentRecoveryData {
    creationTime: Time;
    mnemonic: string;
}
export interface ExtendedNote {
    title: string;
    selfDestructAt?: bigint;
    content: string;
    imagePath?: ExternalBlob;
    createdAt: bigint;
    lastModified: bigint;
}
export type Time = bigint;
export interface ExtendedNoteInput {
    title: string;
    selfDestructAt?: bigint;
    content: string;
    imagePath?: ExternalBlob;
}
export interface UserProfile {
    name: string;
    muteGreeting: boolean;
    isFirstTimeUser: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cleanupExpiredShareLinks(): Promise<void>;
    clearPersistentRecoveryData(): Promise<void>;
    createExtendedNote(noteInput: ExtendedNoteInput): Promise<void>;
    createNote(title: string, content: string, selfDestructAt: bigint | null): Promise<void>;
    createShareLink(encryptedNote: Uint8Array, nonce: Uint8Array, expiresAt: bigint | null, viewOnce: boolean): Promise<string>;
    deleteAllExpiredExtendedNotes(): Promise<void>;
    deleteExtendedNote(title: string): Promise<void>;
    deleteNote(title: string): Promise<void>;
    extendedNoteCleanup(): Promise<void>;
    getAllExtendedNotes(): Promise<Array<ExtendedNote>>;
    getAllNotes(): Promise<Array<Note>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExtendedNote(title: string): Promise<ExtendedNote>;
    getMuteGreetingPreference(): Promise<boolean>;
    getNote(title: string): Promise<Note>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listPersistentRecoveryData(): Promise<Array<[Principal, PersistentRecoveryData]>>;
    markWelcomePopupSeen(): Promise<void>;
    migrate(): Promise<void>;
    openShareLink(shareId: string): Promise<[Uint8Array, Uint8Array]>;
    retrievePersistentRecoveryPhrase(): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchExtendedNotes(searchTerm: string): Promise<Array<ExtendedNote>>;
    searchNotes(searchTerm: string): Promise<Array<Note>>;
    setExtendedNoteSelfDestructTimer(title: string, durationSeconds: bigint): Promise<void>;
    setMuteGreetingPreference(mute: boolean): Promise<void>;
    setSelfDestructTimer(title: string, durationSeconds: bigint): Promise<void>;
    storePersistentRecoveryData(mnemonic: string): Promise<void>;
    updateExtendedNote(title: string, newContent: string, newSelfDestructAt: bigint | null, newImagePath: ExternalBlob | null): Promise<void>;
    updateNote(title: string, newContent: string, newSelfDestructAt: bigint | null): Promise<void>;
}
