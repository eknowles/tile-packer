import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  DBArgs,
  initializeDatabase,
  insertMetadata,
  setupDatabase,
} from "../src/db";
import { BoundingBox } from "../src/utils";

describe("Database", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  it("should initialize the database", () => {
    initializeDatabase(db);
    const result = db
      .query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tiles'",
      )
      .get();
    expect(result.name).toBe("tiles");
  });

  it("should insert metadata", () => {
    initializeDatabase(db);
    insertMetadata(db, "name", "value");
    const result = db
      .query("SELECT value FROM metadata WHERE name='name'")
      .get();
    expect(result.value).toBe("value");
  });

  it("should setup the database with correct metadata", () => {
    const args: DBArgs = {
      bbox: "",
      maxzoom: 5,
      minzoom: 0,
      format: "png",
    };
    const bbox: BoundingBox = { minLon: 1, minLat: 2, maxLon: 3, maxLat: 4 };
    const db = setupDatabase(":memory:", args, bbox);

    const bounds = db
      .query("SELECT value FROM metadata WHERE name='bounds'")
      .get();
    expect(bounds.value).toBe("1,2,3,4");

    const maxzoom = db
      .query("SELECT value FROM metadata WHERE name='maxzoom'")
      .get();
    expect(maxzoom.value).toBe("5");

    const minzoom = db
      .query("SELECT value FROM metadata WHERE name='minzoom'")
      .get();
    expect(minzoom.value).toBe("0");

    const format = db
      .query("SELECT value FROM metadata WHERE name='format'")
      .get();
    expect(format.value).toBe("png");
  });
});
