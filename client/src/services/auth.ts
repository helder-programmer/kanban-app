import { IUser } from "../types/IUser";
import { api } from "./api";

interface IRegisterParams {
    name: string;
    email: string;
    password: string;
}

interface ILoginParams {
    email: string;
    password: string;
}



const authService = {
    signIn: async function (data: ILoginParams) {
        const response = await api.post<{ user: IUser, token: string }>('/users/login', data);
        return response.data;
    },

    recoverUserInformations: async function () {
        const response = await api.get<{ user: IUser }>('/users/recoverUserInformations');
        return response.data;
    },

    register: async function (data: IRegisterParams) {
        const response = await api.post('/users', data);
        return response.data;
    }

}

export { authService };