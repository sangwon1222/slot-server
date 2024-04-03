import config from "./src/config";
import * as auth from "./src/controller/auth";
import * as gameList from "./src/controller/gameList";
import * as point from "./src/controller/point";
import { start } from "./src/express";
import * as DB from "./src/util/DB";

async function databaseInit() {
  // DROP DATABASE IF EXISTS slot;
  const result = await DB.query(`
  CREATE DATABASE IF NOT EXISTS slot;
  use slot;
  `);

  await gameList.initDB();
  await auth.initDB();

  const adminId = "admin";
  await auth.signUp(adminId, "1234", 100);
  await auth.signUp("lucy", "1234");

  await point.initDB();
  await point.charge(adminId, 500);
  await point.charge(adminId, 500);
  await point.charge(adminId, 500);
  await point.charge(adminId, 500);
  await point.charge(adminId, 500);
}
const main = async () => {
  const dbConnected = await DB.init(config.dbConfig);
  console.log("DB connected:", dbConnected);

  await databaseInit();
  await start();

  // @kwonth1210 :  서버를 이곳에서 가동시킬수 있도록 수정. 모든 모듈의 실행 여부는 이곳에서 제어하도록 작성.( 실행하지않을시 오작동 하지않도록 구성할것. )
  // const sockIOServer = await startSocketIOServer(app);
};
main();
