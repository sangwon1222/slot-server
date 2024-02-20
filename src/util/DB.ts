import mysql from "mysql2";
import { QueryError, PoolConnection } from "mysql2";

export type sqlError = QueryError;

export interface DBConnInfo {
  host: string;
  user: string;
  password: string;
  database?: string;
  port: number;
}

let gConfig: DBConnInfo | null = null;

let gDBConnPool: mysql.Pool | null = null;

export async function init(connInfo: DBConnInfo) {
  return new Promise<boolean>((resolve, _reject) => {
    gConfig = connInfo;
    (gConfig as any).multipleStatements = true;
    (gConfig as any).dateStrings = "date";
    console.log("DB init :: ", connInfo.host, connInfo.port);
    gDBConnPool = mysql.createPool(gConfig);
    // 연결을 체크
    try {
      const query = gDBConnPool.query(
        `SELECT CONNECTION_ID();`,
        null,
        (err: sqlError | null, results?: any, fields?: mysql.FieldPacket[]) => {
          //console.log(error)
          if (err) resolve(false);
          resolve(true);
        }
      );
    } catch (ex) {
      resolve(false);
    }
  });
}

export function handle(dbname: string | null = null): mysql.Pool | null {
  return gDBConnPool;
}

export interface QueryReturn {
  err: sqlError | null;
  results?: any;
  fields?: mysql.FieldPacket[];
}

export function query(sql: string, arg: any = null): Promise<QueryReturn> {
  const pool = gDBConnPool;
  return new Promise<QueryReturn>((resolve, reject) => {
    if (pool) {
      const query = pool.query(
        sql,
        arg,
        (err: sqlError | null, results?: any, fields?: mysql.FieldPacket[]) => {
          resolve({ err, results, fields });
        }
      );
      //console.log("query:", query.sql);
    } else {
      reject();
    }
  });
}

export async function transaction(
  workFunc: (connection: PoolConnection) => Promise<boolean>
) {
  const pool = gDBConnPool;
  if (pool) {
    pool.getConnection(
      async (err: NodeJS.ErrnoException | null, connection: PoolConnection) => {
        if (workFunc) {
          const resultFlag = await workFunc(connection);
          if (resultFlag == false) {
            connection.rollback(() => connection.release());
          } else {
            connection.commit((err) => connection.release());
          }
        }
      }
    );
  }
}

export function connQuery(
  connection: PoolConnection,
  sql: string,
  arg: any = null
): Promise<QueryReturn> {
  return new Promise<QueryReturn>((resolve, reject) => {
    if (connection) {
      connection.query(
        sql,
        arg,
        (err: sqlError | null, results?: any, fields?: mysql.FieldPacket[]) => {
          resolve({ err, results, fields });
        }
      );
    } else {
      reject();
    }
  });
}
