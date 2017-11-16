var images = require('./images').images;
var urlParse = require('url');

exports.post = function(req, res) {
    var a = urlParse.parse(req.url, true).query;

    for(var i = 0; i < images.imgs.length; i++) {
        var j = images.imgs[i];
        if (j.id.toString() === a.id) {
            j.title = a.title;
            j.desc = a.desc;
            j.year = a.year;
            j.credits = a.credits;
        }
    }

    res.end();
};
