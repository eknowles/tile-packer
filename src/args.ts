import { parseArgs } from "util";

export interface CliArgs {
  version: boolean;
  help: boolean;
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

export function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
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

  if (values.help) {
    console.log(`
Usage: tilepack -i <input_url> [options]

Options:
  -i, --input <input_url>       The base URL for the XYZ tiles (required)
  -o, --output <output_file>    The path where the MBTiles file will be saved (default: output.mbtiles)
  --minzoom <min_zoom>          The minimum zoom level to fetch tiles
  --maxzoom <max_zoom>          The maximum zoom level to fetch tiles
  --bbox <bounding_box>         The bounding box for the tile fetching in the format minLon,minLat,maxLon,maxLat
  --header <header>             HTTP headers to include in tile requests. Use this option for each header
  --token <api_token>           An API token for authenticated requests. Used in input URL
  --retry <retry_count>         The number of retry attempts for failed requests (default: 0)
  --format <image_format>       The format of the tiles (e.g., png, jpeg) (default: png)
  --concurrency <concurrent_requests> The number of concurrent requests to fetch tiles (default: 15)
  -v, --version                 Show the version number
  -h, --help                    Show this help message
    `);
    process.exit(0);
  }

  return {
    version: values.version as boolean,
    help: values.help as boolean,
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
}
