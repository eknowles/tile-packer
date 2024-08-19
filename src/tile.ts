import { Database } from "bun:sqlite";
import { Args } from "./types";
import {
  BoundingBox,
  createTileUrl,
  fetchTile,
  longitudeToTileColumn,
  latitudeToTileRow,
} from "./utils";

export async function processTile(
  db: Database,
  zoom: number,
  row: number,
  column: number,
  args: Pick<Args, "input" | "token">,
  headers: Record<string, string>,
): Promise<void> {
  const insertTile = db.prepare(
    `INSERT OR REPLACE INTO tiles VALUES (?, ?, ?, ?)`,
  );

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

export function zoomBox(
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

export async function processZoomLevel(
  db: Database,
  zoom: number,
  bbox: BoundingBox,
  args: Pick<Args, "concurrency" | "input" | "token">,
  headers: Record<string, string>,
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
      promises.push(processTile(db, zoom, row, column, args, headers));
      if (promises.length >= args.concurrency) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    await Promise.all(promises);
  }
}
