import express from "express";
const listenPort = 3000;
const app = express();

async function start() {
  // 순서 주의

  app.use(express.static("/"));

  app.listen(listenPort, async () => {
    const env =
      process.env.NODE_ENV == "production" ? `production` : `development`;
    console.log(`server started ${env} [${listenPort}]`);
  });
}

export { start };
