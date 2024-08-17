#!/usr/bin/env bun
import { Database } from "bun:sqlite";
import { parseArgs } from "util";
import {
  longitudeToTileColumn,
  latitudeToTileRow,
  createTileUrl,
  fetchTile,
  initializeDatabase,
  insertMetadata,
  parseBoundingBox,
  BoundingBox,
} from "./utils";
import pkg from "../package.json";

interface CliArgs {
  version: boolean;
  output: string;
  input: string;
  minzoom: number;
  maxzoom: number;
  bbox: string;
  header: string[];
  token: string;
  retry: number;
  format: string;
  concurrency: number;
}

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    version: { type: "boolean", short: "v" },
    output: { type: "string", short: "o", default: "output.mbtiles" },
    input: { type: "string", short: "i" },
    minzoom: { type: "string" },
    maxzoom: { type: "string" },
    bbox: { type: "string" },
    header: { type: "string", multiple: true },
    token: { type: "string" },
    retry: { type: "string", default: "0" },
    format: { type: "string", default: "png" },
    concurrency: { type: "string", default: "15" },
  },
  strict: true,
  allowPositionals: false,
});

const args: CliArgs = {
  version: values.version as boolean,
  output: values.output as string,
  input: values.input as string,
  minzoom: parseInt(values.minzoom as string),
  maxzoom: parseInt(values.maxzoom as string),
  bbox: values.bbox as string,
  header: (values.header as string[]) || [],
  token: (values.token as string) || "",
  retry: parseInt(values.retry as string),
  format: values.format as string,
  concurrency: parseInt(values.concurrency as string),
};

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

const db = new Database(args.output);
initializeDatabase(db);

// https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md#content
insertMetadata(
  db,
  "bounds",
  `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
);
// todo add center
insertMetadata(db, "maxzoom", args.maxzoom.toString());
insertMetadata(db, "minzoom", args.minzoom.toString());
insertMetadata(db, "name", "tilepack");
insertMetadata(db, "type", "overlay"); // should this be baselayer?
insertMetadata(db, "version", "1");
insertMetadata(db, "format", args.format);

const insertTile = db.prepare(
  `INSERT OR REPLACE INTO tiles VALUES (?, ?, ?, ?)`,
);

async function processTile(
  zoom: number,
  row: number,
  column: number,
): Promise<void> {
  try {
    const url = createTileUrl(args.input, zoom, row, column, args.token);
    const tileData = await fetchTile(url, headers);
    const y = (1 << zoom) - 1 - row; // flip y coordinate for mbtiles
    insertTile.run(zoom, column, y, Buffer.from(tileData));
  } catch (error) {
    console.error(
      `Error fetching tile ${zoom}/${column}/${row}:`,
      (error as Error).message,
    );
  }
}

function zoomBox(
  zoom: number,
  bbox: BoundingBox,
): { minColumn: number; maxColumn: number; minRow: number; maxRow: number } {
  const minColumn = longitudeToTileColumn(bbox.minLon, zoom);
  const maxColumn = longitudeToTileColumn(bbox.maxLon, zoom);
  const minRow = latitudeToTileRow(bbox.maxLat, zoom);
  const maxRow = latitudeToTileRow(bbox.minLat, zoom);
  return {
    minColumn,
    maxColumn,
    minRow,
    maxRow,
  };
}

async function processZoomLevel(
  zoom: number,
  bbox: BoundingBox,
): Promise<void> {
  const { minColumn, maxColumn, minRow, maxRow } = zoomBox(zoom, bbox);

  let count = 0;
  for (let row = minRow; row <= maxRow; row++) {
    for (let column = minColumn; column <= maxColumn; column++) {
      count++;
    }
  }

  console.log(`Processing zoom level ${zoom} (${count} tiles)`);

  for (let row = minRow; row <= maxRow; row++) {
    const promises: Promise<void>[] = [];
    for (let column = minColumn; column <= maxColumn; column++) {
      promises.push(processTile(zoom, row, column));
      if (promises.length >= args.concurrency) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    await Promise.all(promises);
  }
}

(async () => {
  for (let zoom = args.minzoom; zoom <= args.maxzoom; zoom++) {
    await processZoomLevel(zoom, bbox);
  }
  console.log("Finished processing all zoom levels");
  db.close();
})();
