var Image = require('../models/Image');
var images = require('./images');

exports.post = function (req, res) {
    console.log(req.files);
    if (!req.files) {
        console.log("333");
        return res.status(400).send('No files were uploaded.');
    }

    var sampleFile = req.files.file;
    var path = '/images/' + sampleFile.name;
    sampleFile.mv('./public' + path, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        var img = new Image(images.id, path, '', '', '', '');
        images.images.imgs.push(img.toJSON());
        images.id++;

        res.json({
            success_: true,
            error_: 0,
            text_: "Done!",
            toAdd: img});
    });
};
