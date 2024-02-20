import * as DB from "@/util/DB";
import { jwt } from "@/util/Token";
import { setEncode } from "@/util/decode";
import { NoError, APIError, SQLError } from "@/util/errors";

function gradeString(grade: number) {
  switch (grade) {
    case 100:
      return "admin";
    default:
      return "user";
  }
}

function checkQueryError(result: DB.QueryReturn) {
  if (result.err) {
    console.log('[auth.ts]  checkQueryError-SQLError => ',SQLError);
    return {
      ...SQLError,
      ok: false,
      msg: result.err.toString(),
      sql: (result.err as any).sql,
    };
  } else {
    return null;
  }
}
//목록
export async function getList() {
  const result = await DB.query(
    `
    SELECT * FROM user ORDER BY idx ASC;
  `,
    []
  );
  const err = checkQueryError(result);
  if (err) return err;
  return {
    ...NoError,
    ok: true,
    list: result.results,
  };
}

export async function getUser(userID: string): Promise<{ok:boolean,data:any}> {
  const result = await DB.query(`SELECT * FROM user WHERE userID=?;`,[userID]);
  console.log(result)
  return {
    ok: true,
    data: result.results[0],
  };
}

export async function updateUserReel(userID: string, turnInGroup:number,prizeTurn :number, currentGroupIndex:number): Promise<{ok:boolean,data:any}> {
  const result = await DB.query(`UPDATE user SET turnInGroup=?,prizeTurn=?, currentGroupIndex=? WHERE userID=?;`,[turnInGroup,prizeTurn,currentGroupIndex,userID]);
  console.log(result)
  const err = checkQueryError(result);
  if (err) return {ok:false, data: err };
  return {
    ok: true,
    data: result.results[0],
  };
}


export async function getUserList(userID?: string) {
  const queryString = userID? `SELECT * FROM user WHERE userID='${userID}' ORDER BY idx;`:"SELECT * FROM user ORDER BY idx;"
  const result = await DB.query(queryString);
  const err = checkQueryError(result);
  if (err) return err;
  return {
    ...NoError,
    ok: true,
    list: result.results,
  };
}

//목록
export async function listup(start: number = 0, count: number = 10) {
  const result = await DB.query(
    `
    SELECT idx,userID FROM user WHERE idx>? ORDER BY idx  LIMIT ?;
  `,
    [start, count]
  );
  const err = checkQueryError(result);
  if (err) return err;
  return {
    ...NoError,
    ok: true,
    list: result.results,
  };
}

// 회원가입
export async function signUp(userID: string, pwd: string, grade: number = 0) {
  const find = await DB.query(
  `
    SELECT idx FROM user WHERE userID=?
  `,
    [userID]
  );
  
  const err_find = checkQueryError(find);
  if (err_find) return err_find;
  
  if (find.results.length > 0) {
    return { ...APIError, msg: "해당 계정은 존재합니다." };
  }
  const result = await DB.query(
    `
      INSERT INTO user (idx,userID,pwd,grade) VALUES(NULL,?,?,?);
    `,
    [userID, pwd, grade]
  );
  
  const err = checkQueryError(result);
  if (err) return err;

  return {...NoError, ok:true, data: [userID]};
}


// 삭제
export async function remove(userID: string) {
  const deleteUser = await DB.query(
    `SELECT userID FROM user WHERE userID=?;
    `,
    [userID]
  );
  const err_delete = checkQueryError(deleteUser);
  if (err_delete) return err_delete;
  if (deleteUser.results.length == 0) return { ...APIError, msg: "해당 계정은 존재하지 않습니다." };
  
  const result = await DB.query(
    `DELETE FROM user WHERE userID=?;`,
    [userID]
  );
  const err = checkQueryError(result);
  if (err) return err;

  return NoError;
}

// 비번 변경
export async function changeInfo(userID: string, pwd: string) {
  const select_ = await DB.query(
    `SELECT idx FROM user WHERE userID=?;
    `,
    [userID]
  );

  const err_select = checkQueryError(select_);
  if (err_select) return err_select;
  if (select_.results.length == 0) {
    return { ...APIError, msg: "해당 계정은 존재하지 않습니다." };
  }

  const update_ = await DB.query(
    `
    UPDATE user SET pwd=? WHERE idx=?;
  `,
    [pwd, select_.results[0].idx]
  );
  const err_update = checkQueryError(update_);
  if (err_update) return err_update;

  return NoError;
}

// 로그인
export async function login(
  userID: string,
  pwd: string,
  fingerPrint: string,
):Promise<{ ok: boolean; data: string; msg: string; err?: string;  }> {
  const select_ = await DB.query(
    `SELECT * FROM user WHERE userID=? AND pwd=?;
    `,
    [userID, pwd]
    );
    
    const err_select = checkQueryError(select_);
  if (err_select) return {ok: false, msg: err_select.msg, data:''};

  if (select_.results.length == 0) {
    return { ...APIError, msg: "해당 계정은 존재하지 않습니다.",data:'' };
  } else {
    
    const grade = gradeString(select_.results[0].grade)
    // refreshToken생성
    const rToken = await jwt.createRefreshToken({
      userID: userID,
      grade: grade,
      fingerPrint: fingerPrint,
    });

    // accessToken 생성
    const aToken = await jwt.createAccessToken({
      userID: userID,
      grade: grade,
      fingerPrint: fingerPrint,
    });

    
    const sendData = JSON.stringify({
      userID: select_.results[0].userID,
      prizeTurn: select_.results[0].prizeTurn,
      turnInGroup: select_.results[0].turnInGroup,
      currentGroupIndex: select_.results[0].currentGroupIndex,
      grade: grade,
      gameTable: select_.results[0].gameTable,
      refreshToken: rToken,
      accessToken: aToken,
    })
    
    const data = setEncode( sendData,'login-info') 
    
    return {
      ...NoError,
      data:data,
      msg:''
    };
  }
}

// 로그인 By RefreshToken
export async function loginByRefreshToken(
  refreshToken: string,
  fingerPrint: string,
  gradeLimit: number = 0
) {
  const info: any = await jwt.verify(refreshToken, 'refresh');

  if (info == null) {
    return { ...APIError, msg: "token Error" };
  }
  if (info.fingerPrint != fingerPrint) {
    return { ...APIError, msg: "fingerPrint Error" };
  }

  const select_ = await DB.query(
    `SELECT * FROM user WHERE userID=?;
    `,
    [info.userID]
  );

  const err_select = checkQueryError(select_);
  if (err_select) return err_select;

  if (select_.results.length == 0) {
    return { ...APIError, msg: "해당 계정은 존재하지 않습니다." };
  } else {
    // checkgrade 미만이면, 에러반환
    if (select_.results[0].grade < gradeLimit) {
      return { ...APIError, msg: "해당 계정 권한이 없습니다." };
    }

    const grade = gradeString(select_.results[0].grade)

    // refreshToken생성
    const rToken = await jwt.createRefreshToken({
      userID: info.userID,
      grade: grade,
      fingerPrint: fingerPrint,
    });

    // accessToken 생성
    const aToken = await jwt.createAccessToken({
      userID: info.userID,
      grade: grade,
      fingerPrint: fingerPrint,
    });

    return {
      ...NoError,
      userID: info.userID,
      prizeTurn: select_.results[0].prizeTurn,
      turnInGroup: select_.results[0].turnInGroup,
      currentGroupIndex: select_.results[0].currentGroupIndex,
      grade: grade,
      gameTable: select_.results[0].gameTable,
      refreshToken: rToken,
      accessToken: aToken,
    };
  }
}

/**유저 게임 등록 */
export async function registGame(userID:string, gameName: string) {
  const result = await DB.query(`UPDATE user SET gameTable=? WHERE userID=?;`,[gameName,userID]);
  const err = checkQueryError(result);
  if (err) return err;
  return {
    ...NoError,
    ok: true,
    data: result.results,
  };
}

// accessToken발급

// refreshToken발급( accessToken 포함 )


// initDB
export async function initDB() {
  const result = await DB.query(`
    CREATE TABLE IF NOT EXISTS user (
      idx INT NOT NULL AUTO_INCREMENT COMMENT '계정인덱스'
      ,userID VARCHAR(100) DEFAULT NULL COMMENT '기기명 or admin계정'
      ,pwd VARCHAR(100) DEFAULT NULL
      ,prizeTurn TINYINT(1) UNSIGNED DEFAULT 0 COMMENT 'group 내부 prize 턴'
      ,turnInGroup TINYINT(1) UNSIGNED DEFAULT 0 COMMENT 'prize 내부 진행 턴'
      ,currentGroupIndex TINYINT(1) UNSIGNED DEFAULT 0 COMMENT 'group index'
      ,grade TINYINT(1) UNSIGNED DEFAULT 0 COMMENT 'admin or 매장기기정보'
      ,gameTable VARCHAR(100) DEFAULT NULL COMMENT '게임 테이블 명'

      ,PRIMARY KEY (idx)
      ,UNIQUE KEY (userID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);

  const err = checkQueryError(result);
  if (err) return err;

  return NoError;
}



