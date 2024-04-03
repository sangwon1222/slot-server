import jwtoken from "jsonwebtoken";

// https://www.npmjs.com/package/jsonwebtoken
enum Algorithm {
  HS256 = "HS256",
  HS384 = "HS384",
  HS512 = "HS512",
  RS256 = "RS256",
  RS384 = "RS384",
  RS512 = "RS512",
  ES256 = "ES256",
  ES384 = "ES384",
  ES512 = "ES512",
  PS256 = "PS256",
  PS384 = "PS384",
  PS512 = "PS512",
  none = "none",
}

const option = {
  algorithm: Algorithm.HS256,
  secret: "slot0503.",
  // refreshExpire: 60 * 60 * 24 * 7, // 1w
  // accessExpire: 60 * 60, // 1h
  refreshExpire: "7days", // 1w
  accessExpire: "30m", // 30m

  issuer: "slot",

  accessSecret: "slot0503._&access",
  refreshSecret: "slot0503._&refresh",
};

async function createRefreshToken(payloads: any) {
  return jwtoken.sign({ type: "refreshToken", ...payloads }, option.refreshSecret, {
    algorithm: option.algorithm,
    expiresIn: option.refreshExpire,
    issuer: option.issuer,
  });
}

async function createAccessToken(payloads: any) {
  return jwtoken.sign({ type: "accessToken", ...payloads }, option.accessSecret, {
    algorithm: option.algorithm,
    expiresIn: option.accessExpire,
    issuer: option.issuer,
  });
}

/* https://www.npmjs.com/package/jsonwebtoken#tokenexpirederror */
async function verify(jwt: string, secretKey?: string) {
  return new Promise((resolve) => {
    let secret = option.accessSecret
    if(secretKey==='refresh') secret = option.refreshSecret

    jwtoken.verify(jwt, secret, (error: any, decoded: any) => {
      if (error) {
        // console.log(secretKey,error.name, error.message)
        // if (error.name != "") console.log("error", error.name, error.message);
        resolve(null);
      } else {
        resolve(decoded);
      }
    });
  });
}

function getParsing(token: string) {
  const base64_payload = token.split('.')[1];
  const payload = Buffer.from(base64_payload, 'base64');
  const result = JSON.parse(payload.toString());
  return result;
}

async function getTokenChk(token: string, secretKey: string) {
  return new Promise((resolve) => {
    try {
        let secret ="";
        if (secretKey === 'access') secret = option.accessSecret
        if (secretKey === 'refresh') secret = option.refreshSecret
        
        jwtoken.verify(token, secret, (error: any, decoded: any) => {
          if (error) {
            if (error.name != "") console.log("error", error.name, error.message);
            resolve(null);
          } else {
            resolve(decoded);
            console.log(secretKey," token",decoded)
          }
        });

        resolve(true);
    } catch (err) {
        resolve(false);
    }
  });
}

export const jwt = {
  Algorithm,
  option,
  createRefreshToken,
  createAccessToken,
  verify,
  getParsing,
  getTokenChk
};
