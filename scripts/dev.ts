import * as Bun from "bun";

import { manifest } from "../app/manifest.ts";

export const server = Bun.serve({
	development: true,
	routes: manifest.routes,
});

console.log(`Listening on ${server.url}`);
