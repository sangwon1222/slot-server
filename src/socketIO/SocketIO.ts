import { Server } from "socket.io";

import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const isProduction = process.env.NODE_ENV == "production";
const origin = isProduction ? "http://www.cuberoom.net" : "*";
const RedisConfig = {
  addr: isProduction
    ? "redis://slot-redis-1:6379"
    : "redis://www.cuberoom.net:33061",
};

export class SocketIO {
  private mSocket: Server;

  constructor(http: any) {
    this.mSocket = new Server(http, {
      //transports: ["websocket"],
      //pingTimeout: 1000,
      //path: "/io/slot",

      cors: {
        // origin: ["*","http://localhost"],
        origin,
        //methods: ["GET", "POST"],
        credentials: Boolean(isProduction),
      },
    });
    this.setupRedisPubSub();
  }

  // @kwonth1210
  // 여기서 socketIO서버의 redis pubsub설정을 맞춰줍니다.
  // 해당 기능은 @socket.io/redis-adapter와 redis모듈 의존성이 있습니다.
  // 참고 사이트: https://socket.io/docs/v4/redis-adapter/
  async setupRedisPubSub() {
    //const pubClient = createClient({ url: "redis://redis:6379" });
    const pubClient = createClient({ url: RedisConfig.addr });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    this.mSocket.adapter(createAdapter(pubClient, subClient) as any);
  }

  async userInfo() {
    const sockets = await this.mSocket.fetchSockets();
    return sockets.map(({ id }) => {
      return { socketId: id };
    });
  }
  // @kwonth1210
  // connect의 의미보다는 listen의 의미가 맞습니다.( 서버이므로 )
  startListen() {
    this.mSocket.on("connect", async (socket) => {
      console.log("income client", socket.id);
      socket.data.rooms = [...(socket as any).adapter.sids];

      socket.emit("enter", {
        socketId: socket.id,
        users: await this.userInfo(),
        clientsCount: (await this.userInfo()).length,
      });

      socket.on("income", async () => {
        socket.emit("income", { clientsCount: (await this.userInfo()).length });
        socket.broadcast.emit("income", {
          clientsCount: (await this.userInfo()).length,
        });
      });
      socket.on("send-chat", async ({ userID, chat, level }) => {
        socket.emit("send-chat", { userID, chat, level });
        socket.broadcast.emit("send-chat", { userID, chat, level });
      });

      socket.on("disconnect", async () => {
        socket.emit("leave", { clientsCount: (await this.userInfo()).length });
        socket.broadcast.emit("leave", {
          clientsCount: (await this.userInfo()).length,
        });
      });
    });

    this.mSocket.listen(3000);
  }

  sendAll(event: string, param: any) {
    this.mSocket.emit(event, param);
  }
}
