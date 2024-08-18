import { Database } from "bun:sqlite";
import { CliArgs } from "./args";
import { BoundingBox } from "./utils";

export type DBArgs = Pick<CliArgs, "format" | "bbox" | "minzoom" | "maxzoom">;

export function setupDatabase(
  filename: string,
  args: DBArgs,
  bbox: BoundingBox,
): Database {
  const db = new Database(filename);
  initializeDatabase(db);

  insertMetadata(
    db,
    "bounds",
    `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
  );
  insertMetadata(db, "maxzoom", args.maxzoom.toString());
  insertMetadata(db, "minzoom", args.minzoom.toString());
  insertMetadata(db, "name", "tilepack");
  insertMetadata(db, "type", "overlay");
  insertMetadata(db, "version", "1");
  insertMetadata(db, "format", args.format);

  return db;
}

export function initializeDatabase(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT);
    CREATE UNIQUE INDEX IF NOT EXISTS name ON metadata (name);
    CREATE TABLE IF NOT EXISTS tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB);
    CREATE UNIQUE INDEX IF NOT EXISTS tile_index ON tiles (zoom_level, tile_column, tile_row);
  `);
}

export function insertMetadata(
  db: Database,
  name: string,
  value: string,
): void {
  db.prepare(`INSERT OR REPLACE INTO metadata VALUES (?, ?)`).run(name, value);
}
