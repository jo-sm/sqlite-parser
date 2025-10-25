import * as fs from "node:fs/promises";
import { describe, test, expect } from "vitest";
import * as pegjs from "pegjs";

const allSqlFixtures = await fs.readdir(`${import.meta.dirname}/sql`, {
	recursive: true,
	withFileTypes: true,
});
const grammar = (
	await fs.readFile(`${import.meta.dirname}/../src/grammar.pegjs`)
).toString();

const parser = pegjs.generate(grammar);

/*
     fuzz-oss1-1.sql 126998ms
     fuzz3-1.sql 126352ms
     fuzzer1-1.sql 126335ms
     fuzzerfault-1.sql 124738ms
     hexlit-1.sql 124735ms
     with1-1.sql 44303ms
     with2-1.sql 44533ms
     withM-1.sql 44501ms
     without_rowid1-1.sql 44495ms
     without_rowid2-1.sql 44492ms
     stmt-1.sql 10802ms
     subquery-1.sql 10796ms
     subquery2-1.sql 10725ms
     subselect-1.sql 10724ms
     substr-1.sql 10720ms
     selectA-2.sql 6143ms
     selectB-1.sql 5346ms
     selectC-1.sql 5331ms
*/

describe(`SQL parsing`, () => {
	// These tests take too long with the current parser
	const ignored = [
		"aggnested-1.sql",
		"fuzz-oss1-1.sql",
		"fuzz3-1.sql",
		"fuzzer1-1.sql",
		"fuzzerfault-1.sql",
		"hexlit-1.sql",
		"with1-1.sql",
		"with2-1.sql",
		"withM-1.sql",
		"without_rowid1-1.sql",
		"without_rowid2-1.sql",
		"stmt-1.sql",
		"subquery-1.sql",
		"subquery2-1.sql",
		"subselect-1.sql",
		"substr-1.sql",
		"selectA-2.sql",
		"selectB-1.sql",
		"selectC-1.sql",
	];

	for (const file of allSqlFixtures) {
		if (
			file.isFile() &&
			file.name.endsWith(".sql") &&
			!ignored.includes(file.name) &&
			// We specifically ignore these tests, they aren't really useful for us and take way too long
			// to be parsed at the moment.
			!file.name.startsWith("randexpr1")
		) {
			const path = `${file.parentPath}/${file.name}`;
			test.concurrent(`${path}`, async () => {
				const input = (await fs.readFile(path)).toString();

				const parsed = parser.parse(input);

				expect(parsed).toMatchSnapshot();
			});
		}
	}
});
