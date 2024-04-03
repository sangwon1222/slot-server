import cors from "cors";
import express from "express";
const listenPort = 3000;
const app = express();

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

async function start() {
  // 순서 주의
  mainRouteConfig(app);

  app.use(express.static("public"));
  app.use("/", express.static("public/client/"));
  app.use("/api", router);

  app.listen(listenPort, async () => {
    const env =
      process.env.NODE_ENV == "production" ? `production` : `development`;
    console.log(`server started ${env} [${listenPort}]`);
  });
}

export { start };
