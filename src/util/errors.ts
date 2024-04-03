export const NoError:{ ok:boolean, err: string } = { ok:true, err: "" };
export const ParamError:{ ok:boolean, err: string } = { ok:false, err: "ParamError" };
export const SQLError:{ ok:boolean, err: string } = { ok:false, err: "SQLError" };
export const APIError:{ ok:boolean, err: string } = { ok:false, err: "APIError" };
export const LoginError:{ ok:boolean, err: string } = {ok:false,  err: "LoginError" };

// 파라메터에 해당 키가 모두 존재하면 null,없으면 해당 키이름 반환
export function paramCheck(param: object, keys: Array<string>) {
  for (const k of keys) {
    if (Object.keys(param).indexOf(k) == -1) {
      console.log("paramCheck-key",k);
      return { ...ParamError, msg: `파라메터에 [${k}]가 없습니다.` };
    }
  }
  return null;
}
