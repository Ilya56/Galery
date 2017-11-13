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
    for(var i = 0; i < arr.length; i++) {
        var sampleFile = arr[i];
        var path = '/images/' + sampleFile.name;
        sampleFile.mv('./public' + path, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            var title = req.body.title[i];
            var desc = req.body.desc[i];
            var year = req.body.year[i];
            var credits = req.body.credits[i];

            var img = new Image(images.id, path, title, desc, credits, year);
            images.images.imgs.push(img.toJSON());
            images.id++;

            res.json({
                success_: true,
                error_: 0,
                text_: "Done!",
                toAdd: img.toJSON()
            });
        });
    }
};
