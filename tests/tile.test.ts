import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { Database } from "bun:sqlite";
import { processTile, zoomBox, processZoomLevel } from "../src/tile";
import { BoundingBox } from "../src/utils";
import { mockFetch } from "./preload";

describe("tiles", () => {
  let db: Database;
  const file = Bun.file("./tests/256.png");

  beforeEach(() => {
    db = new Database(":memory:");
    db.run(`
      CREATE TABLE tiles (
        zoom_level INTEGER,
        tile_column INTEGER,
        tile_row INTEGER,
        tile_data BLOB,
        PRIMARY KEY (zoom_level, tile_column, tile_row)
      )
    `);

    mockFetch.mockReturnValue(Promise.resolve(new Response(file.stream())));
  });

  describe("processTile", () => {
    it("should process a tile and insert it into the database", async () => {
      const args = {
        input: "input.url/{z}/{y}/{x}?key={token}",
        token: "abc123",
        concurrency: 10,
      };
      const headers = { Authorization: "Bearer token" };

      await processTile(db, 1, 2, 3, args, headers);

      const result = db
        .query(
          "SELECT * FROM tiles where zoom_level = 1 and tile_column = 3 and tile_row = -1",
        )
        .get();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.lastCall?.[0]).toBe("input.url/1/2/3?key=abc123");
      expect(mockFetch.mock.lastCall?.[1].headers).toBe(headers);

      expect(result.tile_data.buffer).toEqual(await file.arrayBuffer());
    });
    it("should log an error if fetching a tile fails", async () => {
      const args = {
        input: "input.url/{z}/{y}/{x}?key={token}",
        token: "abc123",
        concurrency: 10,
      };
      const headers = { Authorization: "Bearer token" };
      const consoleErrorMock = spyOn(console, "error").mockImplementation(
        () => ({}),
      );

      mockFetch.mockReturnValueOnce(
        Promise.resolve(new Response(null, { status: 404 })),
      );

      await processTile(db, 1, 2, 3, args, headers);

      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Error fetching tile 1/3/2:",
        "HTTP error! status: 404",
      );

      consoleErrorMock.mockRestore();
    });
  });

  describe("zoomBox", () => {
    it("should calculate zoom box correctly", () => {
      // arrange
      const bbox: BoundingBox = { minLon: 1, minLat: 2, maxLon: 3, maxLat: 4 };

      // act
      const result = zoomBox(0, bbox);

      // assert
      expect(result).toEqual({
        minColumn: 0,
        maxColumn: 0,
        minRow: 0,
        maxRow: 0,
      });
    });
  });

  describe("processZoomLevel", () => {
    it("should process zoom level and insert tiles into the database", async () => {
      // arrange
      const args = { input: "input.url", token: "abc123", concurrency: 10 };
      const headers = { Authorization: "Bearer token" };
      const bbox: BoundingBox = { minLon: 1, minLat: 2, maxLon: 3, maxLat: 4 };

      // act
      await processZoomLevel(db, 0, bbox, args, headers);

      // assert
      const result = db.query("SELECT COUNT(*) as count FROM tiles").get();
      expect(result.count).toBeGreaterThan(0);
    });

    it.skip("should respect the concurrency limit when processing tiles", async () => {
      // todo
    });
  });
});
