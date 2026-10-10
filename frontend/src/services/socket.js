import { io } from "socket.io-client";
import { BACKEND_URL } from "../config/runtime";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export default socket;
