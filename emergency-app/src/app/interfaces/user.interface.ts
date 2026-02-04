export interface User {
    _id?: string;
    username: string;
    password?: string;
    hashedPassword?: string;
    phonenumber: string;
    email: string;
    dateJoined?: Date;
}