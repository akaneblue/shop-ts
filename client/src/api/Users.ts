import api from "./api"
import type { LoginForm, NewUser, User } from "../types/user";

interface LoginResponse{
    message: string;
    user: User;
}

//로그인
export const RequestLogin = async(loginFrom: LoginForm) => {
    const response = await api.post<LoginResponse>("/users/login", loginFrom);
    return response.data.user;
}

//회원 목록
export const getUsers = async() => {
    const response = await api.get<User[]>("/users");
    return response.data;
}

//회원가입(id, role, created_at 자동 생성)
export const createUser = async(newUser: NewUser) => {
    const {username, password, name, email} = newUser
    await api.post("/users",{username, password, name, email});
}