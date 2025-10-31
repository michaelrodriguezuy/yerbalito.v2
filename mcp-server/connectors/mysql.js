import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export async function queryDB(sql) {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "mysql_container",
    user: process.env.MYSQL_USER || "wwwolima",
    password: process.env.MYSQL_PASSWORD || "rjW63u0I6n",
    database: process.env.MYSQL_DATABASE || "wwwolima_yerbalito"
  });

  const [rows] = await conn.execute(sql);
  await conn.end();
  return rows;
}

export default async function handler({ query }) {
  const result = await queryDB(query || "SELECT * FROM jugador LIMIT 5");
  return {
    type: "data",
    data: result
  };

}