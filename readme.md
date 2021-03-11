# @papermooseau/gulp-changed-in-place

**Note: this is a fork of [gulp-changed-in-place](https://github.com/alexgorbatchev/gulp-changed-in-place), which is no longer maintained. This fork adds support for cache files.**

[![Dependency status](https://img.shields.io/david/alexgorbatchev/gulp-changed-in-place.svg?style=flat)](https://david-dm.org/alexgorbatchev/gulp-changed-in-place)
[![devDependency Status](https://img.shields.io/david/dev/alexgorbatchev/gulp-changed-in-place.svg?style=flat)](https://david-dm.org/alexgorbatchev/gulp-changed-in-place#info=devDependencies)
[![Build Status](https://img.shields.io/travis/alexgorbatchev/gulp-changed-in-place.svg?style=flat&branch=master)](https://travis-ci.org/alexgorbatchev/gulp-changed-in-place)

> Only pass through changed files

No more wasting precious time on processing unchanged files.

By default it's only able to detect whether files in the stream changed. If you require something more advanced like knowing if imports/dependencies changed, create a custom comparator, or use [another plugin](https://github.com/gulpjs/gulp#incremental-builds).

How is this different from [gulp-changed](https://github.com/sindresorhus/gulp-changed)? `gulp-changed` checks against build files, for example ES5 files generated by Babel.js from the source ES6 files. `gulp-changed-in-place` monitors source files, ES6 files in this example. This allows you to do things like apply source formatting or linting only to changed files while you are working on them.

## Install

```
$ npm install --save-dev gulp-changed-in-place
```

## Usage

```js
var gulp = require('gulp');
var changedInPlace = require('gulp-changed-in-place');
var tsfmt = require('gulp-tsfmt');

gulp.task('default', function () {
  return gulp.src('src/**/*.{ts,tsx}')
    .pipe(changedInPlace())
    .pipe(tsfmt())
    .pipe(gulp.dest('src'));
});
```

With a cache file to track changes between runs:

```js
var gulp = require('gulp');
var changedInPlace = require('gulp-changed-in-place');
var tsfmt = require('gulp-tsfmt');

gulp.task('default', function () {
  return gulp.src('src/**/*.{ts,tsx}')
    .pipe(changedInPlace({ cache: '.cache/changes.json' }))
    .pipe(tsfmt())
    .pipe(gulp.dest('src'));
});
```

## API

### changed(options)

#### `firstPass`
* `boolean`
* Default = `false`

  Makes `gulp-changed-in-place` pass through all files once on the first run.

#### `cache`
* `Object` || `string`
* Default = `{}`

  Either an object of `{ key: value }` format for all the files that is shared between all runs, or a string representing the path to a file to store the cache in. Values added to the object will be hash or modification time, depending on the `howToDetermineDifference` option.
  
  If a file is specified and does not exist, it will be created (including any parent directories), and `firstPass` will be set to true.

#### `howToDetermineDifference`
* `"hash" || "modification-time"`
* Default = `hash`

  Selects how it is determined if a file has been changed.

  * `hash`: Change will be triggered when SHA1 sum of the file content changes. This is a slower but more correct way.
  * `modification-time`: Change will be triggered based on the modification time stamp (mtime) of the file.

```js
.pipe(changedInPlace({ howToDetermineDifference: "modification-time" }))
```

#### `basePath`
* `string`
* Default = `undefined`

  Allows you to set relative path that will be used for storing paths in the `cache`.

# Version History

[Change log](changelog.md)

# License

The MIT License (MIT)

Copyright (c) 2015 Alex Gorbatchev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
