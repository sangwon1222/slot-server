import * as DB from "@/util/DB";
import { NoError, APIError, SQLError } from "@/util/errors";

function checkQueryError(result: DB.QueryReturn) {
  if (result.err) {
    console.log('[game list.ts]  checkQueryError-SQLError => ',SQLError);
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

/****   GAME LIST ***********************/ 
/****   게임 검색 ***********************/ 
export async function getGameList(params: { name:string} ){
  
  const queryString = params?.name ? 
  `SELECT * FROM  gameList WHERE name LIKE "%${params.name}%";`
    : `SELECT * FROM  gameList;`

  const searchQuery = await DB.query( queryString )
  const err = checkQueryError(searchQuery);
  const result = err ? err : { ...NoError, ok: true, data: searchQuery.results };
  return result;
}

// 
/****  게임 생성 ***********************/ 
export async function createGame( { name, turnCount, score }: any ){
  // await DB.query(`DROP TABLE IF EXISTS ${name.toUpperCase()}`);

  const createQuery = `CREATE TABLE ${name.toUpperCase()} (
    idx INT NOT NULL AUTO_INCREMENT COMMENT '인덱스'
    ,groupIdx INT(100) NOT NULL DEFAULT 0 COMMENT '그룹 인덱스'
    ,groupCount INT(100) NOT NULL DEFAULT 0 COMMENT '그룹 수'
    ,turnCount INT(100) NOT NULL DEFAULT 0 COMMENT '전체 턴 수'
    ,Ycode VARCHAR(100) NOT NULL DEFAULT '' COMMENT '예시 코드'
    ,Pcode VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'p 코드'
    ,score INT NOT NULL DEFAULT 0 COMMENT '점수'
    ,outScore INT NOT NULL DEFAULT 0 COMMENT 'PRIZE 총 점수'
    
    ,PRIMARY KEY (idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`

  const createGameQuery = await DB.query(createQuery)

  if(createGameQuery.err?.code =='ER_TABLE_EXISTS_ERROR') return {ok:false,msg:'중복된 게임명입니다.'}
  if(createGameQuery.err) return {ok: false, msg: createGameQuery.err.message }
  
  const insert = await DB.query(`INSERT INTO gameList (idx, name, turnCount, score) VALUES (NULL,?,?,?)`,[name,turnCount,score])
  return { ...NoError, ok: !createGameQuery.err && !insert.err };
}

/****  게임 내용 추가 ***********************/ 
export async function insertGame( { name, list }: any ){
    try{
    let errMsg = ''
    console.log(list.length)
    for(let i=0; i<list.length; i++){
      const insertQuery = await DB.query(
        `INSERT INTO ${name.toUpperCase()} (idx,turnCount,groupIdx,groupCount,Ycode,Pcode,score,outScore) VALUES(NULL,?,?,?,?,?,?,?)`,
        [ 
          list[i].turnCount,
          list[i].groupIdx,
          list[i].groupCount,
          list[i].Ycode,
          list[i].Pcode,
          list[i].score,
          list[i].outScore
        ]
      )
      const err = checkQueryError(insertQuery);
        if(err) {
          errMsg = err.msg
          break
        }
      }
      
      const result = errMsg ? {ok:false,msg:errMsg} : { ...NoError, ok: true };
      return result;
    }catch(e){
      console.log(e)
      return {ok:false, msg: e};
    }
}

// 
/****  하나의 게임정보 가져오기 ***********************/ 
export async function getGame( { name, groupIdx }: any ){
  if(!name) return {ok:true, data:[], msg: '없음'}
  const queryString = groupIdx!=undefined ? `SELECT * FROM ${name.toUpperCase()} WHERE groupIdx = '${groupIdx}' ORDER BY idx ASC`:`SELECT * FROM ${name.toUpperCase()} ORDER BY idx ASC`
  
  const getQuery = await DB.query(queryString)
  
  const result = getQuery.err ? { ok:false, msg: getQuery.err.message } : { ...NoError, ok: true ,data: getQuery.results};
  return result;
}

// 
/****  게임 삭제 ***********************/ 
export async function deleteGame( name: string,  ){
  const deleteGameQuery = await DB.query(`DROP TABLE IF EXISTS ${name.toUpperCase()}`);
  await DB.query(`DELETE FROM gameList WHERE name = ?`,[ name ]);
  if(deleteGameQuery.err && deleteGameQuery.err?.code =='ER_TABLE_EXISTS_ERROR'){
    return {ok:false,msg:'중복된 게임명입니다.'}
  }else{
    const err = checkQueryError(deleteGameQuery);
    const result = err ? err : { ...NoError, ok: true, data: deleteGameQuery.results };
    return result
  }
}

// 
/****   PRIZE 리스트 검색 ***********************/ 
export async function getPrizeList(params: { name:string} ){
  
  const queryString = params?.name ? 
  `SELECT name, SUM(score) AS totalScore, SUM(turnCount) AS totalTurn FROM  PRIZELIST WHERE name = "${params.name}" GROUP BY name;`
    : `SELECT name, SUM(score) AS totalScore, SUM(turnCount) AS totalTurn FROM  PRIZELIST GROUP BY name;`

  const searchQuery = await DB.query( queryString )
  const err = checkQueryError(searchQuery);
  const result = err ? err : { ...NoError, ok: true, data: searchQuery.results };
  return result;
}

/****   한 PRIZE의 턴 정보 조회 ***********************/ 
export async function getPrize(params: { name:string} ){
  const queryString = `SELECT * FROM PRIZELIST WHERE name=? ORDER BY idx ASC;`

  const searchQuery = await DB.query( queryString ,[params.name])
  const err = checkQueryError(searchQuery);
  const result = err ? err : { ...NoError, ok: true, data: searchQuery.results };
  return result;
}

/****   PRIZE 랜덤 조회 ***********************/ 
export async function getRandomPrize(params: { score: number} ){
  const queryString = `SELECT name FROM PRIZELIST WHERE outScore=? GROUP BY name;`

  const searchQuery = await DB.query( queryString ,[params.score])
  const err = checkQueryError(searchQuery);
  
  const data =[]
  for(let i=0; i<searchQuery.results.length; i++){
    data.push(...Object.values(searchQuery.results[i]))
  }
  const result = err ? err : { ...NoError, ok: true, data: data };
  return result;
}


// PRIZE 업데이트
export async function savePrize( rowData: {name:string,turnCount:number,Ycode:string,Pcode:string,score:number,outScore: number}[]  ){
  if(rowData.length==0)return { ...NoError, ok: true, data: [] }
  const stringQuery = `
    INSERT INTO PRIZELIST 
    (idx,name,turnCount,Ycode,Pcode,score,outScore) 
    VALUES (NULL,?,?,?,?,?,?)
  `
  
  for(let i=0; i < rowData.length; i++){
    const insertQuery = await DB.query(stringQuery,[rowData[i].name,rowData[i].turnCount,rowData[i].Ycode,rowData[i].Pcode,rowData[i].score,rowData[i].outScore])
    const err = checkQueryError(insertQuery);
    console.log(err)
    if(err) return {ok:false,msg:'데이터 추가 실패'}
    
    if(i==rowData.length-1) return { ...NoError, ok: true, data: insertQuery.results };
  }

}

// PRIZE 삭제
export async function deletePrize( name: string ){
  const stringQuery = `DELETE FROM PRIZELIST WHERE name = ?;`
  const deleteQuery = await DB.query(stringQuery , [ name ] )
  const err = checkQueryError(deleteQuery);
  const result = err?{ok:false, err, msg:'PRIZE 삭제 실패'}:{ ...NoError, ok: true, data: deleteQuery.results }

  return result 
}

/**get-score */
export async function getScore( score: number ){
  const stringQuery = score? `SELECT * FROM SCORELIST WHERE score = ?;` :`SELECT * FROM SCORELIST;`
  const getQuery = await DB.query(stringQuery , [ score ] )
  const err = checkQueryError(getQuery);
  const result = err?{ok:false, err, msg:'GET SCORE 실패'}:{ ...NoError, ok: true, data: getQuery.results }

  return result 
}

/**add-score */
export async function addScore( list: {score:number,first:number,second:number,third:number,fourth:number}[] ){
  if(list.length<=0) return {ok:false, msg: '배열 길이 = 0'}
  const keys = Object.keys(list[0]).join()
  let insertString = ''
  for(let i=0; i<list.length; i++){
    insertString+=`( NULL,'${Object.values(list[i]).join("','")}' )`
    if(i!=list.length-1)insertString+=','
  }
  const stringQuery = `INSERT INTO SCORELIST ( idx,${keys} ) VALUES ${insertString};`
  console.log(stringQuery);
  const insertQuery = await DB.query(stringQuery)
  console.log(insertQuery);
  const err = checkQueryError(insertQuery);
  const result = err?{ok:false, err, msg:'ADD SCORE 실패'}:{ ...NoError, ok: true, data: insertQuery.results }
  return result 
}

/**delete-score */
export async function deleteScore( idxList: number[] ){
  const idx = idxList.join('')
  const stringQuery = `DELETE * FROM SCORELIST WHERE in idx = ?;` 
  const deleteQuery = await DB.query(stringQuery , [ idx ] )
  const err = checkQueryError(deleteQuery);
  const result = err?{ok:false, err, msg:'GET SCORE 실패'}:{ ...NoError, ok: true, data: deleteQuery.results }

  return result 
}

// initDB
export async function initDB() {
    const queries = {
        gameList: 
        `
            CREATE TABLE IF NOT EXISTS gameList (
                idx INT NOT NULL AUTO_INCREMENT COMMENT '게임 인덱스'
                ,name VARCHAR(100) NOT NULL COMMENT '게임 이름'
                ,turnCount INT(100) NOT NULL DEFAULT 0 COMMENT '전체 턴 수'
                ,score INT(100) NOT NULL DEFAULT 0 COMMENT '전체 점수'
                
                ,PRIMARY KEY (idx)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `,
        prizeList: 
        `
            CREATE TABLE IF NOT EXISTS PRIZELIST (
                idx INT NOT NULL AUTO_INCREMENT COMMENT '그룹 인덱스'
                ,name VARCHAR(100) NOT NULL COMMENT '그룹 이름'
                ,turnCount INT(100) NOT NULL DEFAULT 0 COMMENT '전체 턴 수'
                ,Ycode VARCHAR(100) NOT NULL DEFAULT '' COMMENT '예시 코드'
                ,Pcode VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'p 코드'
                ,score INT NOT NULL DEFAULT 0 COMMENT 'PRIZE 내부 한 턴의 점수'
                ,outScore INT NOT NULL DEFAULT 0 COMMENT 'PRIZE 총 점수'
                
                ,PRIMARY KEY (idx)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `,

}

  for (const q_ in queries) {
    console.log("> init game-list DB:", q_);
    const result = await DB.query((queries as any)[q_]);
    const err = checkQueryError(result);
    if (err) return err;
  }
  return NoError;
}

