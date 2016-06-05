var app = require('express')();
var sqlite3 = require('sqlite3');

// Prepare database
var db = {};
var sql = new sqlite3.Database(':memory:');

sql.serialize(function() {
    sql.run('CREATE TABLE sites(id INTEGER PRIMARY KEY, url TEXT UNIQUE NOT NULL)');
    db._id = sql.prepare('SELECT id FROM sites WHERE url = ?');
    db._url = sql.prepare('SELECT url FROM sites WHERE id = ?');
    db._new = sql.prepare('INSERT INTO sites(url) VALUES(?)');
});

db.rurl = /^https?:\/\/\S+\..+$/;
db.err  = function(key, cb) {
    cb = cb || function() {};
    return function(err, row) {
        if (err) {
            console.error(err);
            cb();
        }
        else {
            cb(row && row[key]);
        }
    };
};
db.id = function(url, cb) {
    // Get URL
    db._id.get(url, db.err('id', function(id) {
        // If URL doesn't exist
        if (!id) {
            // Create URL
            db._new.get(url, db.err('id', function() {
                db.id(url, cb);
            }));
        }
        else {
            cb(id);
        }
    }));
};
db.url = function(id, cb) {
    db._url.get(id, db.err('url', cb));
};


// ID route
app.get('/:id(\\d+)', function(req, res) {
    db.url(req.params.id, function(url) {
        if (url) {
            res.redirect(url);
        }
        else {
            res.json({ error: 'There is no URL with that id' });
        }
    });
});

// URL route
app.get('/:url*', function(req, res) {
    // if url format is correct
    var url = req.url.substr(1);
    if (db.rurl.test(url)) {
        db.id(url, function(id) {
            res.json({
                original_url: url,
                short_url: ['https://', req.get('host'), id].join('/')
            });
        });
    }
    else {
        res.json({ error: 'Incorrect URL format' });
    }
});

// Homepage
app.get('/', function(req, res) {
    res.send('main');
});


app.listen(process.env.PORT, function() {
    console.log('Listening on port', process.env.PORT);
});