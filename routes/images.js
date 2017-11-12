var Image = require('../models/Image');

var images = {imgs: []};
var url1 = "https://images.unsplash.com/photo-1446645681877-acde17e336a9?dpr=1&auto=format&crop=entropy&fit=crop&w=1500&h=846&q=80&cs=tinysrgb";
var url2 = "https://images.unsplash.com/photo-1432139509613-5c4255815697?dpr=1&auto=format&crop=entropy&fit=crop&w=1500&h=2265&q=80&cs=tinysrgb";
var img1 = new Image(0, url1, "Author", "08.11.17", "public", "TITLE", "alt");
var img2 = new Image(1, url2, "Author", "08.11.17", "public", "TITLE", "alt");
var img3 = new Image(2, url1, "Author", "08.11.17", "public", "TITLE", "alt");
var img4 = new Image(3, url2, "Author", "08.11.17", "public", "TITLE", "alt");
images.imgs.push(img1.toJSON());
images.imgs.push(img2.toJSON());
images.imgs.push(img3.toJSON());
images.imgs.push(img4.toJSON());
var id = 4;

exports.get = function (req, res) {
    res.send(images);
};
exports.post = function (req, res) {
    var newImgs = new Array(images.imgs.length);
    var ids = req.body.ids.split(',');
    console.log(ids);
    for(var i = 0; i < ids.length; i++)
        for(var j = 0; j < images.imgs.length; j++)
            if (images.imgs[j].id.toString() === ids[i])
                newImgs[i] = images.imgs[j];
    console.log(newImgs);
    images.imgs = newImgs;

    res.json({success_: true,
        error_: 0});
};

exports.images = images;
exports.id = id;