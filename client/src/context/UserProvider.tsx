import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import type { User, NewUser, LoginForm, UserUpdateForm } from "../types/user";
import { createUser, getUsers, RequestLogin, modifyUser, getMe, requestLogout } from "../api/Users";

const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 처음에는 로그인 상태를 확인하는 중(true)
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

    // 새로고침해도 로그인 유지: 서버 세션에 로그인 정보가 있는지 물어봅니다.
    useEffect(() => {
        getMe()
            .then(setCurrentUser)               // 세션이 있으면 로그인 상태
            .catch(() => setCurrentUser(null))  // 401이면 로그아웃 상태
            .finally(() => setIsAuthLoading(false));
    }, []);

    // 회원 목록 조회
    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(error => console.log("회원 목록 조회 오류",error));
    },[])

    // 회원가입 함수
    const signup = async( newUser: NewUser) => {
        await createUser(newUser);  //DB 저장
        setUsers(await getUsers()); //회원 배열에 저장
    }

    // 로그인 함수
    const login = async(loginForm: LoginForm) => {
        try {
            const user = await RequestLogin(loginForm)
            if (!user) {
                return false;
            }
            setCurrentUser(user);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 로그아웃 함수
    const logout = async () => {
        await requestLogout();
        setCurrentUser(null);
    }

    const updateUser = async (form: UserUpdateForm) => {
        if (!currentUser) return;
        const updatedUser = await modifyUser(currentUser.id, form);
        setCurrentUser(updatedUser);   // 헤더의 이름이 바로 바뀜
        setUsers(await getUsers());    // 회원 목록(관리자 페이지)도 다시 불러옴
    }

    return(
        <UserContext.Provider value={{ 
            users, 
            signup,
            currentUser,
            isAuthLoading,
            login,
            logout,
            updateUser
         }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;