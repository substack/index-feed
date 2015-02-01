var ixfeed = require('../');
var through = require('through2');
var level = require('level-test')();
var test = require('tape');

test('feed', function (t) {
    t.plan(3);
    var ddb = level('data.db');
    var idb = level('index.db');
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
    
    function ready (err) {
        t.ifError(err);
        var sudoroom = ixf.index.createReadStream('hacker.space', {
            lte: 'sudoroom', gte: 'sudoroom'
        });
        sudoroom.pipe(collect(function (rows) {
            t.deepEqual(rows, [
                {
                    key: 'hacker!1',
                    value: { name: 'substack', hackerspace: 'sudoroom' },
                    index: 'sudoroom',
                },
                {
                    key: 'hacker!2',
                    value: { name: 'mk30', hackerspace: 'sudoroom' },
                    index: 'sudoroom'
                }
            ]);
        }));
        ixf.feed.createReadStream().pipe(collect(function (rows) {
            t.deepEqual(rows, [
                {
                    change: 1,
                    value: [
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
                    ]
                }
            ]);
        }));
    
    }
});

function collect (cb) {
    var rows = [];
    return through.obj(write, end);
    function write (row, enc, next) { rows.push(row); next() }
    function end () { cb(rows) }
}
