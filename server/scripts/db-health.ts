import { pool } from "../db";

const result = await pool.query("select current_database() as database, now() as checked_at");
const row = result.rows[0];

console.log(`Connected to ${row.database} at ${row.checked_at.toISOString()}`);
await pool.end();
