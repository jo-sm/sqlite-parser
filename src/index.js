/**
 * sqlite-parser
 */
import { parse, SyntaxError as PegSyntaxError } from "./parser.js";
import { Tracer } from "./tracer.js";
import { SqliteParserTransform, SingleNodeTransform } from "./streaming.js";

export default function sqliteParser(source, options = {}) {
	const tracer = Tracer();

	const parseOpts = { tracer, startRule: "start" };

	if (options.streaming) {
		parseOpts.startRule = "start_streaming";
	}

	try {
		return parse(source, parseOpts);
	} catch (err) {
		throw err instanceof PegSyntaxError ? t.smartError(err) : err;
	}
}

export function createParser() {
	return new SqliteParserTransform();
}

export function createStitcher() {
	return new SingleNodeTransform();
}
