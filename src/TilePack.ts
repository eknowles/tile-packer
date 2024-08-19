import { setupDatabase } from "./db";
import { processZoomLevel } from "./tile";
import { parseBoundingBox, BoundingBox } from "./utils";
import { Args } from "./types";

export type TilePackOptions = Omit<Args, "help" | "version">;

export class TilePack {
  private readonly options: TilePackOptions;
  private readonly bbox: BoundingBox;
  private readonly headers: Record<string, string>;

  constructor(options: TilePackOptions) {
    this.options = options;
    this.bbox = parseBoundingBox(this.options.bbox);
    this.headers = Object.fromEntries(
      this.options.header.map((h) => h.split(":")),
    );
  }

  public async run() {
    const db = setupDatabase(this.options.output, this.options, this.bbox);

    for (
      let zoom = this.options.minzoom;
      zoom <= this.options.maxzoom;
      zoom++
    ) {
      await processZoomLevel(db, zoom, this.bbox, this.options, this.headers);
    }

    console.log("Finished processing all zoom levels");
    db.close();
  }
}
