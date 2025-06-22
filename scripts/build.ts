import * as Bun from "bun";
import * as fs from "node:fs";
import * as path from "node:path";

import tailwind from "bun-plugin-tailwind";

const OUTDIR = "./dist";
const ENTRYPOINTS = ["./app/manifest.ts"];

const reset = `\u001b[33;0m`;

const green = (str: string) => `${Bun.color("#0E8761", "ansi")}${str}${reset}`;

const blue = (str: string) => `${Bun.color("#027FB0", "ansi")}${str}${reset}`;

const purple = (str: string) => `${Bun.color("#523C79", "ansi")}${str}${reset}`;

function human_file_size(bytes: number) {
	const exponent = bytes && Math.floor(Math.log(bytes) / Math.log(1000.0));

	const decimal = (bytes / Math.pow(1000.0, exponent)).toFixed(
		exponent ? 2 : 0,
	);

	return `${decimal} ${exponent ? `${"KMGTPEZY"[exponent - 1]}B` : "B"}`;
}

function clean() {
	if (fs.existsSync(OUTDIR)) {
		fs.rmSync(OUTDIR, { recursive: true });
	}
}

async function build() {
	const start = performance.now();

	const result = await Bun.build({
		entrypoints: ENTRYPOINTS,
		outdir: OUTDIR,
		target: "bun",
		env: "inline",
		plugins: [tailwind],
	});

	return {
		duration: Math.round(performance.now() - start),
		...result,
	};
}

function log({
	success,
	outputs,
	logs,
	duration,
}: Awaited<ReturnType<typeof build>>) {
	const columns: [number, number, number] = [0, 0, 0];
	const results: { filename: string; size: string; kind: string }[] = [];
	const print = process.stdout.write.bind(process.stdout);

	for (const output of outputs) {
		const filename = path.basename(output.path);
		const filesize = human_file_size(output.size);
		const kind = output.kind.replace("-", " ");

		if (filename.length > columns[0]) {
			columns[0] = filename.length;
		}

		if (filesize.length > columns[1]) {
			columns[1] = filesize.length;
		}

		if (kind.length > columns[2]) {
			columns[2] = kind.length;
		}

		results.push({ filename, size: filesize, kind });
	}

	let indent = "";

	print(
		`${indent}${green(`Bundled ${results.length} modules in ${duration}ms`)}`,
	);

	print("\n");

	indent += "  ";

	for (const { filename, size, kind } of results) {
		const message = `${filename.padEnd(columns[0] + 3, " ")}${size.padEnd(columns[1] + 2, " ")}(${kind})`;

		const highlight = (filename: string, kind: string) =>
			kind === "entry point" ? blue(filename) : purple(filename);

		print(
			`\n${indent}${highlight(filename.padEnd(columns[0] + 3, " "), kind)}${size.padEnd(columns[1] + 2, " ")}(${kind})`,
		);
	}

	print("\n");
}

clean();

const result = await build();

log(result);
