import http from "http";
import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import history from "connect-history-api-fallback";
const listenPort = 4000;
const app = express();
const server = http.createServer(app);

function mainRouteConfig(app: express.Express) {
  app.use(
    express.json({
      limit: "50mb",
    })
  );
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
    })
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

}

import router from "./route";

function initRouter(app: express.Express) {
  app.use("/api", router);
  app.use(express.static("public"));

  app.use("/", history());
  app.use("/", express.static("public/client"));
  app.use("/admin", express.static("public/admin"));
}

async function start(): Promise<http.Server> {
  // 순서 주의
  mainRouteConfig(app);
  initRouter(app);

  server.listen(listenPort, async () => {
    const env =
      process.env.NODE_ENV == "production" ? `production` : `development`;
    console.log(`server started ${env} [${listenPort}]`);
  });

  return server;
}

export { start };
