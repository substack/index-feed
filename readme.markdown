# index-feed

setup a changes feed and indexer for leveldb

This module provides a wrapper around setting up:

* [changesdown](https://npmjs.org/package/changesdown)
* [changes-feed](https://npmjs.org/package/changes-feed)
* [changes-index](https://npmjs.org/package/changes-index)

# example

``` js
var ixfeed = require('index-feed');
var through = require('through2');
var level = require('level');

var ddb = level(__dirname + '/data.db');
var idb = level(__dirname + '/index.db');
var ixf = ixfeed({ data: ddb, index: idb, valueEncoding: 'json' });

ixf.index.add(function (row, cb) {
    if (/^hacker!/.test(row.key)) {
        cb(null, {
            'hacker.name': row.value.name,
            'hacker.space': row.value.hackerspace
        });
    }
    else cb()
});

ixf.feed.createReadStream({ live: true })
    .on('data', function (ch) { console.log('feed:', ch) })
;

ixf.db.batch([
    {
        type: 'put',
        key: 'hacker!1',
        value: { name: 'substack', hackerspace: 'sudoroom' }
    },
    {
        type: 'put',
        key: 'hacker!2',
        value: { name: 'mk30', hackerspace: 'sudoroom' }
    },
    {
        type: 'put',
        key: 'hacker!3',
        value: { name: 'mitch', hackerspace: 'noisebridge' }
    }
], ready);

function ready () {
    // list all hackers at sudoroom:
    var sudoroom = ixf.index.createReadStream('hacker.space', {
        lte: 'sudoroom', gte: 'sudoroom'
    });
    sudoroom.pipe(through.obj(function (row, enc, next) {
        console.log(row.value.name);
        next();
    }));
}
```

# methods

``` js
var ixfeed = require('index-feed')
```

## var ixf = ixfeed(opts)

Create a new `ixf` object from required options:

* `opts.data` - levelup instance to use for storing data
* `opts.index` - levelup instance to use for storing indexes

and optional options:

* `opts.keyEncoding` - keyEncoding to use for log data
* `opts.valueEncoding` - valueEncoding to use for log data

# properties

* ixf.db - levelup database handle that appends to changesdown
* ixf.index - [changes-index](https://npmjs.org/package/changes-index) instance
* ixf.feed - [changes-feed](https://npmjs.org/package/changes-feed) instance

# license

MIT
