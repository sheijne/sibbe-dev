import * as fs from "node:fs";
import * as path from "node:path";

import { manifest } from "../dist/manifest.js";

const build_dir = path.resolve("dist");
const public_dir = path.resolve("public");
const output_dir = path.resolve(".vercel", "output");
const output_static_dir = path.resolve(output_dir, "static");

if (fs.existsSync(output_dir)) {
	fs.rmSync(output_dir, { recursive: true });
}

fs.mkdirSync(output_dir, { recursive: true });
fs.mkdirSync(output_static_dir, { recursive: true });

fs.cpSync(path.join(build_dir, "routes"), path.join(output_static_dir), {
	recursive: true,
});

fs.cpSync(public_dir, output_static_dir, { recursive: true });

for (const route of Object.values(manifest.routes)) {
	for (const file of route.files) {
		if (!file.path.startsWith("routes/")) {
			const filepath = path.join(build_dir, file.path);
			fs.cpSync(filepath, path.join(output_static_dir, file.path));
		}
	}
}

fs.writeFileSync(
	path.resolve(output_dir, "config.json"),
	JSON.stringify(
		{
			version: 3,
			framework: null,
		},
		null,
		2,
	),
);
