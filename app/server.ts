import * as Bun from "bun";

import index from "./routes/index.html";

const server = Bun.serve({
	development: true,

	routes: {
		"/": index,
	},
});

console.log(`Listening on ${server.url}`);
