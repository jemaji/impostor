import { io } from "socket.io-client";

// Connect to the backend server
// Using relative path to allow proxying by Vite (works with ngrok)
export const socket = io();
