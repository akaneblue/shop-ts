import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import type { User, NewUser, LoginForm } from "../types/user";
import { createUser, getUsers, RequestLogin } from "../api/Users";

const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

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
    const logout = () => {
        setCurrentUser(null);
    }

    return(
        <UserContext.Provider value={{ 
            users, 
            signup,
            currentUser,
            login,
            logout
         }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;