import * as DB from "@/util/DB";
import express from "express";
import * as auth from "../../controller/auth";
import { jwt } from "../../util/Token";
import { setDecode, setEncode } from "../../util/decode";
import { paramCheck } from "../../util/errors";
import { getFingerprint } from "../../util/express";

const router = express.Router();

/*[ /api/auth ]*/
router.get("/test", (_req, res) => {
  res.json({ ok: true, msg: "test", data: ["asd", "qwe", "zxvv"] });
});

router.all(
  "/get-user-turn-data",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      res.json(await auth.getUserTurnData(param.userID));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

router.all(
  "/update-reel-data",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      res.json(await auth.updateReelData(param.userID));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// [logApi, verifyAccessToken],
router.post(
  "/get-user-list",
  async (req: express.Request, res: express.Response) => {
    try {
      // if ((req as any).tokenData.grade == "admin") {
      res.json(await auth.getUserList());
      // } else {
      // res.json(await auth.getUserList((req as any).tokenData.userID));
      // }
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);
// router.all(
//   "/get-user-list",
//   [],
//   async (req: express.Request, res: express.Response) => {
//     console.log((req as any).tokenData.grade);
//     console.log((req as any).tokenData.userID);
//     if ((req as any).tokenData.grade == "admin") {
//       res.json(await auth.getUserList());
//     } else {
//       res.json(await auth.getUserList((req as any).tokenData.userID));
//     }
//   }
// );

router.all(
  "/regist-game",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      res.json(await auth.registGame(param.userID, param.gameName));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// 목록
router.all(
  "/listup",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      const chk = paramCheck(param, ["start", "count"]);
      if (chk != null) {
        console.log("[route>auth.ts /listup]", chk);
        res.json(chk);
        return;
      }

      res.json(await auth.listup(parseInt(param.start), parseInt(param.count)));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// 추가
router.all(
  "/signUp",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      const l = JSON.parse(setDecode(param.l, "signup-info") as string);

      const chk = paramCheck(param, ["l"]);

      if (chk != null) {
        res.json(chk);
        return;
      }

      res.json(await auth.signUp(l.id, l.pw));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// 삭제
router.all(
  "/remove",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;

      const chk = paramCheck(param, ["idx"]);
      if (chk != null) {
        res.json(chk);
        return;
      }

      res.json(await auth.remove(param.idx));
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// 로그인
router.all(
  "/login",
  [],
  async (req: express.Request, res: express.Response) => {
    try {
      const param = req.body;
      const l = param.l;
      const { userID, pwd } = JSON.parse(setDecode(l, "login-info"));
      const chk = paramCheck({ userID, pwd }, ["userID", "pwd"]);
      if (chk) {
        res.json(chk);
        return;
      }

      const fingerPrint = getFingerprint(req);
      const result = await auth.login(userID, pwd, fingerPrint);
      res.json(result);
    } catch (e) {
      console.log(e);
      res.json({ ok: false, msg: e });
    }
  }
);

// 로그인 by refreshToken
router.all(
  "/loginByToken",
  [],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    const chk = paramCheck(param, ["refreshToken"]);
    if (chk != null) {
      res.json(chk);
      return;
    }

    let gradeLimit = 0;
    if (param.gradeLimit) {
      gradeLimit = param.gradeLimit;
    }

    const fingerPrint = getFingerprint(req);
    res.json(
      await auth.loginByRefreshToken(
        param.refreshToken,
        fingerPrint,
        gradeLimit
      )
    );
  }
);

// 유저 존재여부 체크
router.all(
  "/check",
  [],
  async (req: express.Request, res: express.Response) => {
    const param = req.body;
    if (!param.userID || !param.pwd) {
      res.json({
        ok: false,
        err_detail: "사용자아이디 또는 비밀번호정보가 없습니다.",
      });
    }
    const result = await DB.query(
      `SELECT * FROM user WHERE userID=? AND pwd=?`,
      [param.userID, param.pwd]
    );
    res.json({
      ok: true,
      count: result.results.length,
    });
  }
);

router.all(
  "/reissue-access-token",
  [],
  async (req: express.Request, res: express.Response) => {
    /**올바른 refresh token이 들어왔는지 체크 */
    if (req.headers.refresh) {
      const data = await jwt.verify(req.headers.refresh as string, "refresh");
      console.log(data);
      if (data == null) res.json({ ok: false, msg: "refresh token expired" });
    }

    /**기존 access token이 올바른 token인지 체크 */
    if (req.headers.authorization && req.headers.refresh) {
      const expiredAccessToken = req.headers.authorization;
      const refreshToken = req.headers.refresh as string;
      const accessDecode = jwt.getParsing(expiredAccessToken);
      const refreshDecode = jwt.getParsing(refreshToken);
      const check =
        accessDecode.userID == refreshDecode.userID &&
        accessDecode.grade == refreshDecode.grade &&
        accessDecode.fingerPrint == refreshDecode.fingerPrint;

      /**올바른 access token이지만 기간 만료 => refresh 재발행 */

      if (check) {
        const newAccessToken = await jwt.createAccessToken({
          userID: refreshDecode.userID,
          grade: refreshDecode.grade,
          fingerPrint: refreshDecode.fingerPrint,
        });

        const userData = await auth.getUserList(refreshDecode.userID);
        console.log(userData);
        console.log(userData.data);

        const sendData = JSON.stringify({
          userID: refreshDecode.userID,
          grade: refreshDecode.grade,
          prizeTurn: userData.data.prizeTurn,
          turnInPrize: userData.data.turnInPrize,
          currentGroupIndex: userData.data.currentGroupIndex,
          gameTable: userData.data.gameTable,
          refreshToken: refreshToken,
          accessToken: newAccessToken,
        });
        const data = setEncode(sendData, "login-info");
        res.json({ ok: true, data: data });
      } else {
        /**기존 access token 다름 */
        res.json({ ok: false, msg: "not match access token" });
      }
    } else {
      /** header에 token정보 없음 */
      res.json({ ok: false, msg: "token undefined" });
    }
  }
);

export default router;
