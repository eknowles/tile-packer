# tile-packer

Fetches XYZ tiles from a URL within a given zoom level range, creates an MBTiles
file that can be converted into a PMTiles file.

Supports custom headers, and concurrency control.

## Installation

```bash
brew tap eknowles/tools
brew install tile-packer
```

## Usage

```bash
tile-packer -i <input_url> [options]
```

## Options

- `-i, --input <input_url>` (required):
  The base URL for the XYZ tiles.

- `-o, --output <output_file>` (default: `output.mbtiles`):
  The path where the MBTiles file will be saved.

- `--minzoom <min_zoom>`:
  The minimum zoom level to fetch tiles.

- `--maxzoom <max_zoom>`:
  The maximum zoom level to fetch tiles.

- `--bbox <bounding_box>`:
  The bounding box for the tile fetching in the
  format `minLon,minLat,maxLon,maxLat`.

- `--header <header>` (can be used multiple times):
  HTTP headers to include in tile requests. Use this option for each header.

- `--token <api_token>`:
  An API token for authenticated requests.

- `--retry <retry_count>` (default: `0`):
  The number of retry attempts for failed requests.

- `--format <image_format>` (default: `png`):
  The format of the tiles (e.g., `png`, `jpeg`).

- `--concurrency <concurrent_requests>` (default: `15`):
  The number of concurrent requests to fetch tiles.

## Example

```bash
tile-packer \
  --input "https://example.com/tiles/{z}/{x}/{y}.png" \
  --output satellite.mbtiles \
  --minzoom 2 \
  --maxzoom 13 \
  --bbox=-180,-85,180,85 \
  --header "Authorization: Bearer <token>" \
  --concurrency 20
```

This command will fetch tiles from zoom level 5 to 13 within the specified
bounding box, save them as `satellite.mbtiles`, and use 20 concurrent requests
for fetching.

## Converting to PMTiles

Once the MBTiles file is generated, you can convert it to a PMTiles.

```shell
pmtiles convert satellite.mbtiles satellite.pmtiles
```
