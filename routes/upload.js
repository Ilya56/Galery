var Image = require('../models/Image');
var images = require('./images');

exports.post = function (req, res) {
    console.log(req.files);
    if (!req.files) {
        console.log("333");
        return res.status(400).send('No files were uploaded.');
    }
    var sampleFile = req.files.files;
    var path = '/images/' + sampleFile.name;
    sampleFile.mv('./public' + path, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        var title = req.body.title;
        var desc = req.body.desc;
        var year = req.body.year;
        var credits = req.body.credits;

        var img = new Image(images.id, path, title, desc, credits, year);
        images.images.imgs.push(img.toJSON());
        images.id++;

        res.json({success_: true,
            error_: 0,
            text_: "Done!",
            toAdd: img.toJSON()});
    });
};
