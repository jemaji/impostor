import { io } from "socket.io-client";

const URL =
  import.meta.env.VITE_SERVER_URL ||
  (window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3001");

export const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
