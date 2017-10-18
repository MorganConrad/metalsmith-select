[![Build Status](https://secure.travis-ci.org/MorganConrad/metalsmith-select.png)](http://travis-ci.org/MorganConrad/metalsmith-select)
[![License](http://img.shields.io/badge/license-MIT-A31F34.svg)](https://github.com/MorganConrad/metalsmith-select)
[![NPM Downloads](http://img.shields.io/npm/dm/metalsmith-select.svg)](https://www.npmjs.org/package/metalsmith-select)
[![Known Vulnerabilities](https://snyk.io/test/github/morganconrad/metalsmith-select/badge.svg)](https://snyk.io/test/github/morganconrad/metalsmith-select)
[![Coverage Status](https://coveralls.io/repos/github/MorganConrad/metalsmith-select/badge.svg)](https://coveralls.io/github/MorganConrad/metalsmith-select)

# metalsmith-select
Creates ("selects") a temporary subset of Metalsmith's filedata, on which you can use plugins.  Then call `done()` to return to normal flow with all files.  Useful if your plugins are very long, expensive, or conflicting.

**Warning**: If the plugins add or remove "files", **this wil not work**.  It does work if they modify existing files, metalsmith, etc...

Functional Programmers might think of this as "`filter().forEach()`", but, unlike modules like [metalsmith-filter](https://www.npmjs.com/package/metalsmith-filter) it does not permanently change the original files object.

Procedural Programmers could think of this as "`if/then/else`": for all files, if they pass the selection criteria, then use the plugins.

```
const select = require('metalsmith-select');
  ...
.use(select(options))           // select a subset of files
  .thenUse(plugin1(options1))   // plugin1 uses the subset
  .thenUse(plugin2(options2))   // as does plugin2
  .elseUse(yaPlugin(yaOptions)) // rejected files go through yaPlugin
  .done()
.use(...)                       // back to original flow with full set of files
```

### options

Due to the special nature of this plugin, Javascript only, no CLI. (???)  

Usually **options** is an object of key/testCriteria properties, e.g.
 ```
{
   key1: testCriteria1,
   key2: testCriteria2
}
```
For each property, `let valueToBeTested = fileData[key];`  **Exception**: when the key is `__filename__`, use the filename.

The selection test depends on testCriteria.
<pre>
 boolean : whether valueToBeTested exists (or not)
 RegExp  : RegExp.test(valueToBeTested)
 String  : convert String to a RegExp and .test(valueToBeTested)
 function: testCriteria(valueToBeTested, metalsmith)
</pre>

Files that pass **all** of the tests get passed to `thenUse()`.<br>  Rejected files get passed to `elseUse()`.

If **options** is null or {}, all files are accepted, say, if you want to use [metalsmith-filter](https://www.npmjs.com/package/metalsmith-filter) instead.

If **options** is a function, the selection criteria is `options(fileData, metalsmith)`.  This gives you complete control for offbeat cases.

### Notes, Todos, and Caveats

Side Effect:  **select** adds a `__filename__` property to every file object.

To simulate an OR, just `use(select())` twice:

```
use(select(options_left_half_of_OR))
  .thenUse(somePlugin(itsOptions))
.use(select((options_right_half_of_OR))
  .thenUse(somePlugin(itsOptions))
```

I haven't tested `select` all that much in practice, and it's doing tricky stuff, so beware.

### Examples

Only pass files with a field "usePrismJS" to metalsmith-prism

```
use(select({ usePrismJS: true })
  .thenUse(metalsmithPrism())
```
