import { describe, it, expect, beforeEach } from "bun:test";
import {
  tileColumnToLongitude,
  tileRowToLatitude,
  longitudeToTileColumn,
  latitudeToTileRow,
  createTileUrl,
  fetchTile,
  parseBoundingBox,
} from "../src/utils";
import { mockFetch } from "./preload";

describe("Utils", () => {
  describe("tileColumnToLongitude", () => {
    it("should convert tile column to longitude", () => {
      const result = tileColumnToLongitude(1, 1);
      expect(result).toBe(0);
    });
  });

  describe("tileRowToLatitude", () => {
    it("should convert tile row to latitude", () => {
      const result = tileRowToLatitude(1, 1);
      expect(result).toBeCloseTo(0, 5);
    });
  });

  describe("longitudeToTileColumn", () => {
    it("should convert longitude to tile column", () => {
      const result = longitudeToTileColumn(-90, 0);
      expect(result).toBe(0);
    });
  });

  describe("latitudeToTileRow", () => {
    it("should convert latitude to tile row", () => {
      const result = latitudeToTileRow(0, 1);
      expect(result).toBe(1);
    });
  });

  describe("createTileUrl", () => {
    it("should create a tile URL", () => {
      const result = createTileUrl(
        "http://example.com/{z}/{x}/{y}?token={token}",
        1,
        1,
        1,
        "abc123",
      );
      expect(result).toBe("http://example.com/1/1/1?token=abc123");
    });
  });

  describe("fetchTile", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      });
    });

    it("should fetch a tile", async () => {
      const result = await fetchTile("http://example.com/tile", {});
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it("should throw an error if fetch fails", () => {
      global.fetch = mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      expect(fetchTile("http://example.com/tile", {})).rejects.toThrow(
        "HTTP error! status: 404",
      );
    });
  });

  describe("parseBoundingBox", () => {
    it("should parse a bounding box string", () => {
      const result = parseBoundingBox("1,2,3,4");
      expect(result).toEqual({ minLon: 1, minLat: 2, maxLon: 3, maxLat: 4 });
    });
  });
});
