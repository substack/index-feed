var sublevel = require('subleveldown');
var changes = require('changes-feed');
var changesdown = require('changesdown');
var indexer = require('changes-index');
var through = require('through2');
var defaults = require('levelup-defaults');
var readonly = require('read-only-stream');

module.exports = function (opts) {
    var idb = defaults(opts.index, opts);
    var feed = changes(sublevel(opts.data, 'feed'));
    var db = changesdown(sublevel(opts.data, 'db', opts), feed, opts);
    var ix = indexer({ ixdb: idb, chdb: db, feed: feed });
    var xfeed = {
        append: feed.append,
        createReadStream: function (opts) {
            var r = feed.createReadStream(opts);
            var tr = through.obj(function (row, enc, next) {
                this.push(ix._decode(row.value));
                next();
            });
            return readonly(r.pipe(tr));
        }
    };
    return { index: ix, feed: xfeed, db: db };
};
