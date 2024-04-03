import express from "express";
import { logApi, getFingerprint, verifyAccessToken } from "@/util/express";
import * as DB from "@/util/DB";
import { NoError, APIError, SQLError, paramCheck } from "@/util/errors";
import { jwt } from "@/util/Token";

import * as auth from "@/controller/auth";
import * as point from "@/controller/point";

const router = express.Router();

/*[ /api/point ]*/

// 포인트 보유정보 열람
router.all(
  "/info",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    //const param = req.body;
    const userID = (req as any).tokenData.userID;
    res.json(await point.getInfo(userID));
  }
);

// 충전
router.all(
  "/charge",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, ["userID", "point"]);
    if (chk != null) {
      res.json(chk);
      return;
    }
    res.json(await point.charge(param.userID, param.point));
  }
);

// 충전 내역 열람
router.all(
  "/charge_history/:dateFrom~:dateTo",
  [logApi, verifyAccessToken],
  async (req: express.Request, res: express.Response) => {
    //const param = req.body;
    //const chk = paramCheck(param, ["userID", "point"]);
    //if (chk != null) {
    //  res.json(chk);
    //  return;
    //}
    // 관리자 라면, 파라메터로 온 다른 아이디도 열람할수 있다.

    const userID = (req as any).tokenData.userID;

    const dateFrom = (req.params as any).dateFrom;
    const dateTo = (req.params as any).dateTo;

    console.log(new Date(dateFrom).toLocaleString());
    console.log(new Date(dateTo).toLocaleString());
    res.json(
      await point.chargeHistory(userID, new Date(dateFrom), new Date(dateTo))
    );
    //res.json(await point.add(param.userID, param.point));
  }
);
export default router;
