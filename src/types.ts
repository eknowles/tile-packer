export interface Args {
  // Show the version number
  version: boolean;

  // Show this help message
  help: boolean;

  // The path where the MBTiles file will be saved (default: output.mbtiles)
  output: string;

  // The base URL for the XYZ tiles (required)
  input: string;

  // The minimum zoom level to fetch tiles
  minzoom: number;

  // The maximum zoom level to fetch tiles
  maxzoom: number;

  // The bounding box for the tile fetching in the format minLon,minLat,maxLon,maxLat
  bbox: string;

  // HTTP headers to include in tile requests
  header: string[];

  // An API token for authenticated requests. Used in input URL
  token: string;

  // The number of retry attempts for failed requests (default: 0)
  retry: number;

  // The format of the tiles (e.g., png, jpeg) (default: png)
  format: string;

  // The number of concurrent requests to fetch tiles (default: 15)
  concurrency: number;
}
