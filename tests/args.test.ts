import { describe, it, expect } from "bun:test";
import { parseCliArgs } from "../src/args";

describe("parseCliArgs", () => {
  it("should parse all arguments correctly", () => {
    const input = "http://example.com/{z}/{y}/{x}?token={token}";
    Bun.argv = [
      "node",
      "script.js",
      "--version",
      "--output=output.mbtiles",
      `--input=${input}`,
      "--minzoom=0",
      "--maxzoom=5",
      "--bbox=1,2,3,4",
      "--header=Authorization:Bearer token",
      "--token=abc123",
      "--retry=3",
      "--format=jpeg",
      "--concurrency=10",
    ];

    const args = parseCliArgs();

    expect(args.version).toBe(true);
    expect(args.output).toBe("output.mbtiles");
    expect(args.input).toBe(input);
    expect(args.minzoom).toBe(0);
    expect(args.maxzoom).toBe(5);
    expect(args.bbox).toBe("1,2,3,4");
    expect(args.header).toEqual(["Authorization:Bearer token"]);
    expect(args.token).toBe("abc123");
    expect(args.retry).toBe(3);
    expect(args.format).toBe("jpeg");
    expect(args.concurrency).toBe(10);
  });
});
