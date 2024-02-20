import express from "express";
import {
  logApi,
  verifyAccessToken,
} from "@/util/express";
import { paramCheck } from "@/util/errors";

import * as gameList from "@/controller/gameList";

const router = express.Router();

/*[ /api/game-list ]*/

router.all(
  "/get-game-list",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.getGameList(param) );
  }
);

// GAME 생성
router.all(
  "/create-game",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "name" ,"turnCount", "score"]);
    if (chk != null) {
      console.log('[route gameList /create-game]',chk)
      res.json(chk);
      return;
    }

    res.json( await gameList.createGame(param) );
  }
);


// 하나의 GAME 정보 가져오기
router.all(
  "/get-game",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "name"]);
    if (chk != null) {
      console.log('[route gameList /get-game]',chk)
      res.json(chk);
      return;
    }

    res.json( await gameList.getGame(param) );
  }
);

// GAME 내용 추가
router.all(
  "/add-game-contents",
  [ verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "name","list" ]);
    if (chk != null) {
      console.log('[route gameList /add-game-contents]',chk)
      res.json(chk);
      return;
    }

    res.json( await gameList.insertGame(param) );
  }
);


// 게임 삭제
router.all(
  "/delete-game",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "name" ]);
    if (chk != null) {
      console.log('[route gameList /delete-game]',chk)
      res.json(chk);
      return;
    }

    res.json( await gameList.deleteGame(param.name) );
  }
);

// PRIZE LIST 조회
router.all(
  "/get-prize-list",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.getPrizeList(param) );
  }
);

// PRIZE 상세 조회
router.all(
  "/get-prize",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.getPrize(param) );
  }
);

// 랜덤 PRIZE 상세 조회
router.all(
  "/get-random-prize",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.getRandomPrize(param) );
  }
);


// PRIZE 업데이트
router.all(
  "/save-prize",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "rowData" ]);
    if (chk != null) {
      console.log('[route gameList /save-prize]',chk)
      res.json(chk);
      return;
    }

    res.json( await gameList.savePrize(param.rowData) );
  }
);

// PRIZE 삭제
router.all(
  "/delete-prize",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, [ "name" ]);
    if (chk != null) {
      console.log('[route gameList /delete-prize]',chk)
      res.json(chk);
      return;
    }
    res.json( await gameList.deletePrize(param.name) );
  }
);


// SCORE 조회
router.all(
  "/get-score",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.getScore(param.score) );
  }
);

// SCORE 조회
router.all(
  "/add-score",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    res.json( await gameList.addScore(req.body.list) );
  }
);


// SCORE 삭제
router.all(
  "/delete-score",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    res.json( await gameList.deleteScore(param.idxList) );
  }
);



export default router;
