import Database from "better-sqlite3";
const db = new Database("data/teacher.db");
console.log(db.prepare("SELECT 1 as ok").get());
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
