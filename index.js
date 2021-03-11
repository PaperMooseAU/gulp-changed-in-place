var crypto = require('crypto');
var path = require('path');
var through = require('through2');
var fs = require('fs');

var GLOBAL_CACHE = {};

// look for changes by mtime
function processFileByModifiedTime(stream, firstPass, basePath, file, cache) {
  var newTime = file.stat && file.stat.mtime;
  var filePath = basePath ? path.relative(basePath, file.path) : file.path;
  var oldTime = cache[filePath];

  cache[filePath] = newTime.getTime();

  if ((!oldTime && firstPass) || (oldTime && oldTime !== newTime.getTime())) {
    stream.push(file);
  }
}

// look for changes by sha1 hash
function processFileBySha1Hash(stream, firstPass, basePath, file, cache) {
  // null cannot be hashed
  if (file.contents === null) {
    // if element is really a file, something weird happened, but it's safer
    // to assume it was changed (because we cannot said that it wasn't)
    // if it's not a file, we don't care, do we? does anybody transform directories?
    if (file.stat.isFile()) {
      stream.push(file);
    }
  } else {
    var newHash = crypto.createHash('sha1').update(file.contents).digest('hex');
    var filePath = basePath ? path.relative(basePath, file.path) : file.path;
    var currentHash = cache[filePath];

    cache[filePath] = newHash;

    if ((!currentHash && firstPass) || (currentHash && currentHash !== newHash)) {
      stream.push(file);
    }
  }
}

function mapCacheKeys(cache, fn) {
  return Object.entries(cache).reduce(
    (acc, [path, hash]) => ({
      ...acc,
      [fn(path)]: hash
    }),
    {}
  );
}

const relativiseCache = cache =>
  mapCacheKeys(cache, cachePath => path.relative(process.cwd(), cachePath));
const absolutiseCache = cache =>
  mapCacheKeys(cache, cachePath => path.join(process.cwd(), cachePath));

module.exports = function (options) {
  options = options || {};

  var processFile;

  switch (options.howToDetermineDifference) {
    case 'hash':
      processFile = processFileBySha1Hash;
      break;
    case 'modification-time':
      processFile = processFileByModifiedTime;
      break;
    default:
      processFile = processFileBySha1Hash;
  }

  var basePath = options.basePath || undefined;
  var firstPass = options.firstPass === true;

  let cache = options.cache;
  let cacheFile;
  if (typeof cache === 'string') { 
    cacheFile = cache;
    try {
      cache = absolutiseCache(JSON.parse(fs.readFileSync(cacheFile))) 
    } catch (error) {
      cache = {};
      firstPass = true;
      console.log(`Missing or invalid cache file (${cacheFile}), all files will be treated as changed.`);
    }
  } else {
    cache = cache || GLOBAL_CACHE;
  }

  const stream = through.obj(function (file, encoding, callback) {
    processFile(this, firstPass, basePath, file, cache);
    callback();
  })

  if (cacheFile) {
    stream.on("end", () => {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(relativiseCache(cache)));
    });
  }

  return stream;
}
