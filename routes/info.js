var images = require('./images').images;

exports.post = function(req, res) {
    //var a = urlParse.parse(req.url, true).query;
    var a = JSON.parse(req.body.data);
    console.log(req.body);

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
