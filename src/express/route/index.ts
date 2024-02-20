import express from "express";
import router_auth from "./auth";
import router_point from "./point";
import router_gameList from "./gameList";
import {getToday} from '../../util/util'

const router = express.Router();

router.all("/", [], async (req: express.Request, res: express.Response) => {
  const param = req.body;
  res.json({
    msg: `slot api service. ${getToday()}`,
  });
});

router.use("/auth", router_auth);
router.use("/point", router_point);
router.use("/gameList", router_gameList);

export default router;
