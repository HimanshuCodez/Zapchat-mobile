import axios from "axios";

export const axioss= axios.create({
    baseURL: import.meta.env.MODE === "development" ? " http://localhost:5001/api" : "/api",
    withCredentials: true, // This is required for authenticated requests
})