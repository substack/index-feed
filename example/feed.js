var ixfeed = require('../');
var through = require('through2');
var level = require('level');

var ddb = level('/tmp/data.db');
var idb = level('/tmp/index.db');
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

/*
ixf.feed.createReadStream({ live: true })
    .on('data', function (ch) { console.log('feed:', ch) })
;
*/

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
