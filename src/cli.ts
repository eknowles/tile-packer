#!/usr/bin/env bun
import { parseCliArgs } from "./args";
import { TilePack } from "./TilePack";
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

const tilePack = new TilePack(args);
tilePack.run();
