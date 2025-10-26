/**
 * sqlite-parser
 */
import { parse, SyntaxError as PegSyntaxError } from "./parser";
import { Tracer } from "./tracer";
import { SqliteParserTransform, SingleNodeTransform } from "./streaming";

export default function sqliteParser(source, options = {}) {
	const tracer = Tracer();

	const parseOpts = { tracer, startRule: "start" };

	if (options.streaming) {
		parseOpts.startRule = "start_streaming";
	}

	try {
		return parse(source, opts);
	} catch (err) {
		throw e instanceof PegSyntaxError ? t.smartError(e) : e;
	}
}

sqliteParser["createParser"] = function () {
	return new SqliteParserTransform();
};

sqliteParser["createStitcher"] = function () {
	return new SingleNodeTransform();
};

sqliteParser["NAME"] = "sqlite-parser";
sqliteParser["VERSION"] = "@@VERSION";
