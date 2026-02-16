import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    sender: string;
    recipients: Array<string>;
    timestamp: bigint;
}
export interface Fee {
    status: string;
    amount: bigint;
}
export interface Profile {
    name: string;
    role: string;
    address: string;
    phone: string;
}
export interface HomeworkEntry {
    title: string;
    dueDate: string;
    description: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHomework(classId: string, entry: HomeworkEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignFormTeacher(classId: string, teacherPhone: string): Promise<void>;
    assignTeacherToClass(teacherPhone: string, classId: string): Promise<void>;
    deleteHomework(classId: string): Promise<void>;
    getAllProfiles(): Promise<Array<Profile>>;
    getAttendance(classId: string, studentPhone: string): Promise<boolean>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFees(phone: string): Promise<Fee | null>;
    getHomework(classId: string): Promise<HomeworkEntry | null>;
    getMessages(): Promise<Array<Message>>;
    getProfile(phone: string): Promise<Profile | null>;
    getUserProfile(phone: string): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(classId: string, studentPhone: string, present: boolean): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    sendMessage(message: Message): Promise<void>;
    undoAttendance(classId: string, studentPhone: string): Promise<void>;
    undoFee(phone: string): Promise<void>;
    undoHomework(classId: string): Promise<void>;
    undoProfile(phone: string): Promise<void>;
    updateFee(phone: string, fee: Fee): Promise<void>;
    updateProfile(profile: Profile): Promise<void>;
}
