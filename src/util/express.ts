import * as Express from "express";
import hash32 from "murmurhash3js";
import { jwt } from "./Token";

export function logApi(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  console.log(`[${new Date().toLocaleString()}] ${req.originalUrl}`, req.body);
  next();
}

// https://g-booking.medium.com/jwt-fingerprint-tokens-af56215bb19a
// https://www.npmjs.com/package/express-fingerprint

// 브라우저의 fingerPrint생성
export function getFingerprint(req: Express.Request) {
  //console.log(`[${new Date().toLocaleString()}] ${req.originalUrl}`, req.body);
  // console.log(req.headers);
  const header: any = req.headers;
  const data =
    header.host +
    header["sec-ch-ua"] +
    header["user-agent"] +
    header["accept-language"];
  // console.log(data);

  return hash32.x86.hash128(data);
  //console.log(req.rawHeaders);
}

// access토큰을 분석하여, 문제시 401 반환
export async function verifyAccessToken(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  const bearerHeader = req.headers.authorization;
  let accessToken = "";
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    accessToken = bearer[1];
  } else{ 
    accessToken = req.body.accessToken ? req.body.accessToken : '';
  }
  
  const data = await jwt.verify(accessToken, 'access');
  
  if (data == null) {
    res.status(401).json({ err: "access token expired" });
    return;
  }
  (req as any).tokenData = data;
  next();
}

// refresh token check
export async function verifyRefreshToken(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  const refreshToken = req.headers.refresh as string;
  
  const data = await jwt.verify(refreshToken, 'refresh');
  
  if (data == null) {
    res.status(401).json({ err: "refresh token expired" });
    return;
  }
  (req as any).tokenData = data;
  next();
}

// 권한 체크 : 연결의 권한이 admin:0인지 판별. 아니면 403에러반환
export async function checkAdmin(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  // 토큰데이터가 없으면 에러반환
  if (!(req as any).tokenData || !(req as any).tokenData.grade) {
    res.status(403).json({ err: "계정정보를 알수 없습니다." });
    return;
  }

  const grade = (req as any).tokenData.grade;
  if (grade != "admin") {
    res.status(403).json({ err: "관리자 권한이 아닙니다." });
    return;
  }
  next();
}



// redis 세션
// https://m.blog.naver.com/scw0531/221165327133
