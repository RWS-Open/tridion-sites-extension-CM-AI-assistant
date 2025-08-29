import axios, { AxiosInstance } from "axios"
export class AxiosClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': "application/json"
            }
        })

        this.client.interceptors.request.use((config) => {
            return config;
        }, (error) => Promise.reject(error));

        this.client.interceptors.response.use((response) => response, (error) => Promise.reject(error.response || error.message))
    }
}