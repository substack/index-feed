# index-feed

setup a changes feed and indexer for leveldb

This module provides a wrapper around setting up:

* [changesdown](https://npmjs.org/package/changesdown)
* [changes-feed](https://npmjs.org/package/changes-feed)
* [changes-index](https://npmjs.org/package/changes-index)

# example

``` js
var ixfeed = require('index-feed');
var level = require('level');

var ddb = level(__dirname + '/data.db', { valueEncoding: 'json' });
var idb = level(__dirname + '/index.db');

var ixf = ixfeed();
ixf.index.add(function (row, cb) {
    if (/^user!/.test(row.key)) {
        cb(null, {
            'user.name': row.value.name,
            'user.space': row.value.hackerspace
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
        key: 'user!1',
        value: { name: 'substack', hackerspace: 'sudoroom' }
    },
    {
        type: 'put',
        key: 'user!2',
        value: { name: 'mk30', hackerspace: 'sudoroom' }
    },
    {
        type: 'put',
        key: 'user!3',
        value: { name: 'mitch', hackerspace: 'noisebridge' }
    }
], ready);

function ready () {
    var sudoroom = ixf.indexes.createReadStream('user.space', {
        lte: 'sudoroom',
        gte: 'sudoroom'
    });
    sudoroom.pipe(through.obj(function (row, enc, next) {
        console.log(row.value.name);
        next();
    }));
}
```

