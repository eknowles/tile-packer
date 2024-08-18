#!/usr/bin/env bun
import { parseCliArgs } from "./args";
import { setupDatabase } from "./db";
import { processZoomLevel } from "./tile";
import { parseBoundingBox } from "./utils";
import pkg from "../package.json";

const args = parseCliArgs();

if (args.version) {
  console.log(`tilepack ${pkg.version}`);
  process.exit(0);
}

if (!args.input || !args.bbox) {
  console.error(
    "Missing required arguments. Use --help for usage information.",
  );
  process.exit(1);
}

const bbox = parseBoundingBox(args.bbox);
const headers: Record<string, string> = Object.fromEntries(
  args.header.map((h) => h.split(":")),
);

const db = setupDatabase(args.output, args, bbox);

(async () => {
  for (let zoom = args.minzoom; zoom <= args.maxzoom; zoom++) {
    await processZoomLevel(db, zoom, bbox, args, headers);
  }
  console.log("Finished processing all zoom levels");
  db.close();
})();
