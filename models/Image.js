function Image(id, url, uploadedBy, uploadDate, uploadTo, title, alt) {
    this.id = id;
    this.url = url;
}
Image.prototype.toJSON = function () {
    return {
        id: this.id,
        url: this.url
    }
};
module.exports = Image;