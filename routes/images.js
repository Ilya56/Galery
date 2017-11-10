var Image = require('../models/Image');

var images = {imgs: []};
var url1 = "https://images.unsplash.com/photo-1446645681877-acde17e336a9?dpr=1&auto=format&crop=entropy&fit=crop&w=1500&h=846&q=80&cs=tinysrgb";
var url2 = "https://images.unsplash.com/photo-1432139509613-5c4255815697?dpr=1&auto=format&crop=entropy&fit=crop&w=1500&h=2265&q=80&cs=tinysrgb";
var img1 = new Image(0, url1, "Author", "08.11.17", "public", "TITLE", "alt");
var img2 = new Image(1, url2, "Author", "08.11.17", "public", "TITLE", "alt");
images.imgs.push(img1.toJSON());
images.imgs.push(img2.toJSON());
var id = 2;

exports.get = function (req, res) {
    res.send(images);
};

exports.images = images;
exports.id = id;