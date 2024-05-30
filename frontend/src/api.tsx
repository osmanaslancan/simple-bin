
import axios, { AxiosInstance } from "axios";
import React, { createContext } from "react";

interface BinDto {
    id: string
    content: string
}

interface Credentials {
    token:string
}

class Api {
    _axios: AxiosInstance;
    constructor() {
        this._axios = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
        });
    }

    async createBin(data: { content: string }, credentials: Credentials) {
        return this._axios.post<BinDto>("/bin/create", data, {
            headers: {
                Authorization: `Bearer ${credentials.token}`
            }
        });
    }

    async getBin(id: string) {
        return this._axios.get<BinDto>(`/bin/get/${id}`);
    }
}

const api = new Api();

const ApiContext = createContext<Api>(api);

export const ApiProvider = ({children} : {children: React.ReactNode}) => {
    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    return React.useContext(ApiContext);
};
