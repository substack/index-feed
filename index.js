var sublevel = require('subleveldown');
var changes = require('changes-feed');
var changesdown = require('changesdown');
var indexer = require('changes-index');
var through = require('through2');
var defaults = require('levelup-defaults');

module.exports = function (opts) {
    var feed = changes(sublevel(opts.data, 'feed'));
    var db = changesdown(sublevel(opts.data, 'db', opts), feed, opts);
    var idb = defaults(opts.index, opts);
    var ix = indexer({ ixdb: idb, chdb: db, feed: feed });
    return {
        index: ix,
        feed: {
            append: feed.append,
            createReadStream: function (opts) {
                return through.obj(function (row, enc, next) {
                    this.push(ix._decode(row));
                    next();
                });
            }
        },
        db: db
    };
};
