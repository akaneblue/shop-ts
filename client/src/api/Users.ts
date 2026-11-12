import api from "./api"
import type { LoginForm, NewUser, User, UserUpdateForm} from "../types/user";

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

// 회원 정보 수정: 바뀐 회원 정보(비밀번호 제외)를 돌려받습니다.
export const modifyUser = async (id: number, form: UserUpdateForm) => {
  const response = await api.put<User>(`/users/${id}`, form);
  return response.data;
}

// 로그인 확인: 서버 세션에 남아 있는 회원 정보를 받습니다. (로그아웃 상태면 401 오류)
export const getMe = async () => {
  const response = await api.get<User>('/users/me');
  return response.data;
}

// 로그아웃: 서버의 세션을 지웁니다.
export const requestLogout = async () => {
  await api.post('/users/logout');
}