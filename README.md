# sqlite-parser

`sqlite-parser` is a JavaScript library that parses SQLite SQL queries using [`peggy`](https://peggyjs.org). The grammar is written against the official spec and the test suite runs against over 95% of [the official test cases](http://www.sqlite.org/src/tree?ci=trunk&name=test), only ignoring a few test cases due to parsing time. 

Other publicly available tested grammars failed in various ways against the official test suite, so while they might work in most cases, if you need a grammar that is as close to the official spec as possible, this is it. 

Note: while it may work for other SQL dialects, compatibility isn't guaranteed due to slight differences between e.g. SQLite and Postgres. Proceed with caution.

## Install

```
npm install @jo-sm/sqlite-parser
```

## Basic Usage

The library exposes a function that accepts two arguments: a string containing SQL to parse and (optional) options. If an AST cannot be generated from the
input string then a descriptive error is generated.

``` javascript
import parser from '@jo-sm/sqlite-parser';

const query = 'select pants from laundry;';
const ast = parser(query);

console.log(ast);
```

**NOTE**: The parent library supported an async callback approach as the second/third argument to the parser function. This was removed in this fork as the actual `parse` functionality runs synchronously regardless and can block on large files. If you anticipate using this in an enviroment where you may parse complex and/or large files, I would recommend to put it in a subprocess or WebWorker.

## Use parser on Node streams *(experimental)* **(since v1.0.0)**

This library also includes *experimental* support as a [stream transform](https://nodejs.org/api/stream.html) that can accept a _readable_ stream of SQL statements and produce a JSON string, representing the AST of each statement, as it is read and transformed. Using this method, the parser can handle files containing hundreds or thousands of queries at once without running into memory limitations. The AST for each statement is pushed down the stream as soon as it is read and parsed instead of reading the entire file into memory before parsing begins.

``` javascript
import * as fs from 'node:fs';
import { createParser } from '@jo-sm/sqlite-parser';

const parserTransformStream = createParser();
const inputStream = fs.createReadStream('./large-input-file.sql');

inputStream.pipe(parserTransformStream);
parserTransformStream.pipe(process.stdout);

parserTransformStream.on('error', function (err) {
  console.error(err);
  process.exit(1);
});

parserTransformStream.on('finish', function () {
  process.exit(0);
});
```

To pipe the output into a file that contains a single valid JSON structure, you can use the `createStitcher` function to create another transform stream that wraps all of the output JSON in such a way that it becomes valid JSON too, in the form of `{ "statement": [...] }`:

```javascript
import * as fs from 'node:fs';
import { createParser, createStitcher } from '@jo-sm/sqlite-parser';

const parserTransformStream = createParser();

const stitcher = createStitcher();
const inputStream = fs.createReadStream('./large-input-file.sql');
const outputStream = fs.createWriteStream('./large-output-file.json');

inputStream.pipe(parserTransformStream);
parserTransformStream.pipe(stitcher);
stitcher.pipe(outputStream);
```

## AST

The AST is compatible with the parent repo, and all updates in version `1.x` will be compatible with the parent. 

However, backwards compatibility with the original libraries isn't strictly a goal, and so while being compatible won't just be randomly broken, certain improvements may introduce breaking changes. In those cases, the major version will be bumped.

### Example

You can provide one or more SQL statements at a time. The resulting AST object has, at the highest level, a statement list node that contains an array of statements.

#### Input SQL

``` sql
SELECT
 MAX(honey) AS "Max Honey"
FROM
 BeeHive
```

#### Result AST

``` json
{
  "type": "statement",
  "variant": "list",
  "statement": [
    {
      "type": "statement",
      "variant": "select",
      "result": [
        {
          "type": "function",
          "name": {
            "type": "identifier",
            "variant": "function",
            "name": "max"
          },
          "args": {
            "type": "expression",
            "variant": "list",
            "expression": [
              {
                "type": "identifier",
                "variant": "column",
                "name": "honey"
              }
            ]
          },
          "alias": "Max Honey"
        }
      ],
      "from": {
        "type": "identifier",
        "variant": "table",
        "name": "beehive"
      }
    }
  ]
}
```

## Syntax Errors

This parser will try to create *descriptive* error messages when it cannot parse some input SQL. In addition to an approximate location for the syntax error, the parser will attempt to describe the area of concern (e.g.: `Syntax error found near Column Identifier (WHERE Clause)`).

## Contributing

Contributions and PRs are welcome! 

## Potential changes and improvements

There are currently a few planned changes and improvements:

- Go over the issues and open PRs from the original repos and see if they are still valid and if they make sense to add to this repo.
- Support at least top level comments. At the moment comments are ignored entirely, but there are some cases you may want to know what comments were at the top of a statement, such as in [`hugsql`](https://hugsql.org/hugsql-in-detail/sql-file-conventions) where the top level comments have meaning about how the SQL is processed.
- Support transforming an AST back into SQL.
- Investigate migrating to [`tsPEG`](https://github.com/EoinDavey/tsPEG) to give better TypeScript support. This will require a large amount of work since `tsPEG` is not directly compatible with `peggy` and so the grammar will need to be rewritten in part or whole.

## Thanks

I didn't originally write this; this is just a fork. This repo is forked from [`getappmap/sql-parser`](https://github.com/getappmap/sql-parser), which is itself a fork of [`codeschool/sqlite-parser`](https://github.com/codeschool/sqlite-parser). Many thanks to [Nicholas Wronski](https://github.com/nwronski) and [Rafał Rzepecki](https://github.com/dividedmind) for the original repos and work on this!

# License

MIT.