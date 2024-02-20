import http from "http";
import { SocketIO } from "./SocketIO";

export function startSocketIOServer(http: http.Server): SocketIO {
  const server = new SocketIO(http);
  server.startListen();
  return server;
}
