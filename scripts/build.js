#!/usr/bin/env node

import * as fs from "node:fs/promises";
import peggy from "peggy";

const projectRoot = await fs.realpath(`${import.meta.dirname}/..`);
const srcDir = `${projectRoot}/src`;
const buildDir = `${projectRoot}/dist`;

try {
	await fs.stat(buildDir);
	await fs.rm(buildDir, { recursive: true, force: true });
} catch {
	// Dir doesn't exist, we don't need to remove it
}

await fs.mkdir(buildDir);
await fs.cp(srcDir, buildDir, { recursive: true });

const grammar = (
	await fs.readFile(`${projectRoot}/dist/grammar.pegjs`)
).toString();
const parserSrc = peggy.generate(grammar, {
	allowedStartRules: ["start", "start_streaming"],
	cache: true,
	output: "source",
	format: "es",
});

await fs.writeFile(`${buildDir}/parser.js`, parserSrc);

await fs.rm(`${buildDir}/grammar.pegjs`);
