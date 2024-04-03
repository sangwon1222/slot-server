import * as DB from "@/util/DB";
import { NoError, APIError, SQLError } from "@/util/errors";

function checkQueryError(result: DB.QueryReturn) {
  if (result.err) {
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

//보유 포인트 정보
export async function getInfo(userID: string) {
  if (!userID) return { ...APIError, msg: "잘못된 유저아이디 정보입니다." };
  const result = await DB.query(
    `
    SELECT IFNULL( p.point, 0) as point FROM user as u
    LEFT JOIN point as p ON u.idx=p.userIDX
    WHERE u.userID=? 
  `,
    [userID]
  );
  const err = checkQueryError(result);
  if (err) return err;
  if (result.results.length == 0) {
    return { ...APIError, msg: "계정이 존재하지 않습니다." };
  }
  return {
    ...NoError,
    point: result.results[0].point,
  };
}

// 포인트 추가
export async function charge(userID: string, point: number) {
  const result = await DB.query(`CALL add_point(?,?)`, [userID, point]);
  const err = checkQueryError(result);
  if (err) return err;

  return NoError;
}

// 포인트 충전 내역
export async function chargeHistory(userID: string, from: Date, to: Date) {
  const result = await DB.query(
    `
  SELECT idx,point,pointResult,regDate FROM log_point_charge
  WHERE regDate BETWEEN ? AND ?`,
    [from, to]
  );
  const err = checkQueryError(result);
  if (err) return err;

  return { ...NoError, list: result.results };
}

// initDB
export async function initDB() {
  const queries = {
    create: `
    CREATE TABLE point (
      userIDX INT NOT NULL COMMENT '계정인덱스'
      ,point INT UNSIGNED DEFAULT 0 COMMENT '보유 포인트'
      ,PRIMARY KEY (userIDX)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `,
    log_charge: `
    # 충전 기록
    CREATE TABLE log_point_charge (
      idx INT NOT NULL AUTO_INCREMENT COMMENT '인덱스'
      ,userIDX INT NOT NULL COMMENT '계정인덱스' 
      ,point INT UNSIGNED DEFAULT 0 COMMENT '처리 포인트'
      ,pointResult INT UNSIGNED DEFAULT 0 COMMENT '처리후 보유 포인트'
      ,regDate DATETIME DEFAULT NOW() COMMENT '처리 시간'
      ,PRIMARY KEY (idx)
      ,INDEX( userIDX )
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `,
    log_use: `
    # 사용 기록
    CREATE TABLE log_point_use (
      idx INT NOT NULL AUTO_INCREMENT COMMENT '인덱스'
      ,userIDX INT NOT NULL COMMENT '계정인덱스' 
      ,point INT UNSIGNED DEFAULT 0 COMMENT '처리 포인트'
      ,pointResult INT UNSIGNED DEFAULT 0 COMMENT '처리후 보유 포인트'
      ,regDate DATETIME DEFAULT NOW() COMMENT '처리 시간'
      ,PRIMARY KEY (idx)
      ,INDEX( userIDX )
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `,
    proc_add: `
    #proc 포인트 추가
    
    DROP PROCEDURE IF EXISTS add_point;
    CREATE PROCEDURE add_point( 
      IN userID_ VARCHAR(100), 
      IN point_ INT )
    BEGIN
      DECLARE uidx__ INT;
      DECLARE point__ INT;
      DECLARE custom_exception CONDITION FOR SQLSTATE '45000';

      SELECT 
        u.idx, IFNULL(p.point,0) INTO uidx__,point__ 
      FROM user AS u
      LEFT JOIN point AS p 
        ON u.idx=p.userIDX 
      WHERE u.userID=userID_;

      IF ( uidx__ ) THEN
        INSERT INTO point 
          (userIDX, point) 
        VALUES 
          ( uidx__, point_) 
        ON DUPLICATE KEY UPDATE 
          point=point__+point_
        ; 

        INSERT INTO log_point_charge 
          (userIDX,point,pointResult,regDate)
        VALUES
          (uidx__,point_, point__+point_, NOW())
        ;
      ELSE
        SIGNAL CUSTOM_EXCEPTION
        SET MESSAGE_TEXT = '해당계정이 존재하지 않습니다.';
      END IF;
      
    END    
    `,
  };

  for (const q_ in queries) {
    console.log("> init point DB:", q_);
    const result = await DB.query((queries as any)[q_]);
    
    const err = checkQueryError(result);
    if (err) return err;
  }

  return NoError;
}
