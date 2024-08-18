import { parseArgs } from "util";

export interface CliArgs {
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

export function parseCliArgs(): CliArgs {
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

  return {
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
}
