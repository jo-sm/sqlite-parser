import * as fs from "node:fs/promises";
import { describe, test } from "vitest";
import * as peggy from "peggy";

const allSqlFixtures = await fs.readdir(`${import.meta.dirname}/sql`, {
	recursive: true,
	withFileTypes: true,
});
const grammar = (
	await fs.readFile(`${import.meta.dirname}/../src/grammar.pegjs`)
).toString();

const parser = peggy.generate(grammar);
// These tests take too long with the current parser
const ignored = [
	"aggnested-1.sql",
	"fuzz-oss1-1.sql",
	"with1-1.sql",
	"subquery-1.sql",
];

describe(`SQL parsing`, () => {
	for (const file of allSqlFixtures) {
		if (
			file.isFile() &&
			file.name.endsWith(".sql") &&
			!ignored.includes(file.name) &&
			// We specifically ignore these tests, they aren't really useful for us and take way too long
			// to be parsed at the moment.
			!file.name.startsWith("randexpr1")
		) {
			const absPath = `${file.parentPath}/${file.name}`;
			const testName = absPath.substring(import.meta.dirname.length);

			test.concurrent(testName, async ({ expect }) => {
				const input = (await fs.readFile(absPath)).toString();

				try {
					const parsed = parser.parse(input);
					expect(parsed).toMatchSnapshot();
				} catch (err) {
					// This file is expected to throw
					if (file.name === "parse-error-1.sql") {
						return;
					}

					throw err;
				}
			});
		}
	}
});
