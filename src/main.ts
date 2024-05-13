import { start } from "./express";

const main = async () => {
  // const dbConnected = await DB.init(config.dbConfig);
  // console.log("DB connected:", dbConnected);
  // await databaseInit();

  await start();

  // @kwonth1210 :  서버를 이곳에서 가동시킬수 있도록 수정. 모든 모듈의 실행 여부는 이곳에서 제어하도록 작성.( 실행하지않을시 오작동 하지않도록 구성할것. )
  // const sockIOServer = await startSocketIOServer(app);
};
main();
