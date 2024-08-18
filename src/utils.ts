export function tileColumnToLongitude(column: number, zoom: number): number {
  return (column / Math.pow(2, zoom)) * 360 - 180;
}

export function tileRowToLatitude(row: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * row) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export function longitudeToTileColumn(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function latitudeToTileRow(lat: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
}

export function createTileUrl(
  tilemapUrl: string,
  zoom: number,
  row: number,
  column: number,
  token: string,
): string {
  return tilemapUrl
    .replace("{z}", zoom.toString())
    .replace("{x}", column.toString())
    .replace("{y}", row.toString())
    .replace("{token}", token);
}

export async function fetchTile(
  url: string,
  headers: Record<string, string>,
): Promise<ArrayBuffer> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.arrayBuffer();
}

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export function parseBoundingBox(bboxString: string): BoundingBox {
  const [minLon, minLat, maxLon, maxLat] = bboxString
    .split(/[\s,]/)
    .map(parseFloat);
  return { minLon, minLat, maxLon, maxLat };
}
