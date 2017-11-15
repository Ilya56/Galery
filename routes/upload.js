var Image = require('../models/Image');
var images = require('./images');

exports.post = function (req, res) {
    console.log(req.files);
    if (!req.files) {
        console.log("333");
        return res.status(400).send('No files were uploaded.');
    }

    var arr;
    if (Array.isArray(req.files.files)) {
        arr = req.files.files;
    } else {
        arr = [req.files.files];
    }

    var titles = req.body.title.split(',');
    var descs = req.body.desc.split(',');
    var years = req.body.year.split(',');
    var credits = req.body.credits.split(',');

    var json = [];
    var m = arr.length;

    arr.forEach(function (item, i) {
        var sampleFile = item;
        var path = '/images/' + sampleFile.name;
        sampleFile.mv('./public' + path, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            var title = titles[i];
            var desc = descs[i];
            var year = years[i];
            var credit = credits[i];

            var img = new Image(images.id, path, title, desc, credit, year);
            images.images.imgs.push(img.toJSON());
            images.id++;
            json.push(img.toJSON());

            if (--m === 0) {
                console.log(json);
                res.json({
                    success_: true,
                    error_: 0,
                    text_: "Done!",
                    toAdd: json});
            }
        });
    });
};
