/*
  42team contributors: main@42team.org
  name: Galery
  description: Gallery for admin integration
  by: Ilya Dolmatov
  dolmatoffilya@gmail.com
*/

function Galery(params) {
    this.uploadAction = params.upload;
    this.manager = '#' + params.displayId;
    this.dropzoneId = 'dz-' + params.displayId;
    var viewType = params.viewType;
    if (viewType === 'images') {
        this.dataJSON = params.images.dataListener;
        this.preview = params.images.previewListener;
        for (var i = 0; i < params.images.acceptedFiles.length; i++)
            params.images.acceptedFiles[i] = '.' + params.images.acceptedFiles[i];
        this.acceptedFiles = params.images.acceptedFiles.join(', ');
        this.imagesJSON = params.images.data;
        this.modalId = 'file-modal-' + this.manager;
    }
    if (viewType === 'image')

    this.prevIndex = 0;
    this.ids = [];
    this.images = [];

    this.init();
}

function Image(id, url, title, description, credits, year) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.description = description;
    this.credits = credits;
    this.year = year;
}
Image.prototype.toJSON = function () {
    return {
        id: this.id,
        url: this.url,
        title: this.title,
        description: this.description,
        credits: this.credits,
        year: this.year
    }
};

Galery.prototype.dropzoneInit = function() {
    var this_ = this;
    var mdz = new Dropzone('#' + this.dropzoneId, {
        acceptedFiles: this_.acceptedFiles
    });
    mdz.on('success', function (file, res) {
        console.log(res);

        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
        $('.label-start').remove();
        $('.dz-preview').remove();

        if (res.success_) {
            this_.addElement(res.toAdd);
            this_.images.push(res.toAdd);
            this_.sendData(this_.dataJSON, this_.images);
        }
    });
    mdz.on('error', function () {
        $('.dz-success-mark').remove();
        $('.dz-error-mark').click(function () {
            $('.label-start').remove();
            $('.dz-preview').remove();
        });
    });
    //$('.dz-hidden-input')[0].accept = acceptedFiles;
};

Galery.prototype.addElement = function(img, prim) {
    var elem = "<div class=\"image-container" + (prim ? ' picked-as-primary' : '') + "\">\n" +
        "<div class=\"inner-image-container\">\n" +
        "  <div class=\"on-image-controls\">\n" +
        "    <div class=\"delete-confirm\">Confirm deleting!</div>\n" +
        "      <span class=\"fa fa-arrows\"></span>\n" +
        "      <span class=\"fa fa-check\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Pick as primary\"></span>\n" +
        "      <span class=\"fa fa-info-circle\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Image info\"></span>\n" +
        "      <span class=\"fa fa-times\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete image\"></span>\n" +
        "    </div>\n" +
        "    <div class=\"center-container\">\n" +
        "      <img src=" + img.url + " title='" + img.title + "' desc='" + img.description +
        "' year='" + img.year + "' credits='" + img.credits + "'\n" + "id='" + img.id + "'>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "</div>";

    var temp = document.createElement('div');
    temp.innerHTML = elem;

    $(this.manager)[0].appendChild(temp.firstChild);

    this.setListener();
};

Galery.prototype.setListener = function () {
    var this_ = this;
    $('.on-image-controls > .fa-check').click(function() {
        $('.image-container').removeClass('picked-as-primary');
        $(this).parents('.image-container').addClass('picked-as-primary');
        var url = $(this).parents('.image-container')[0].children[0].children[1].children[0].src;
        console.log(url.substr(url.indexOf('/', 8), url.length));
        this_.sendData(this_.preview, url.substr(url.indexOf('/', 8), url.length));
    });

    $('.on-image-controls > .fa-info-circle').click(function() {
        console.log('1');
        var image = $(this).parents('.image-container').find('img');
        var path = image.attr('src');
        var filename = path.replace(/\\/g, '/');
        filename = filename.substring(filename.lastIndexOf('/')+ 1).replace(/[?#].+$/, '');
        var extension = path.split('.').pop();
        var dimensions = image.get(0).naturalWidth + ' x ' + image.get(0).naturalHeight;
        var desc = image.attr('desc');
        var title = image.attr('title');
        var year = image.attr('year');
        var credits = image.attr('credits');
        var id = image.attr('id');

        console.log('2');
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = function() {
            if(this.readyState === this.DONE) {
                if(this.response.byteLength >= 1000000) {
                    var filesize = this.response.byteLength/1000000;
                    filesize = Math.round(filesize * 10)/10 + ' MB';
                } else {
                    var filesize = Math.round(this.response.byteLength/1000) + ' KB';
                }
                $('.static-data #filesize').text(filesize);
            }
        };
        xhr.send(null);
        console.log('3');

        $('#image-preview-modal').html('<img src="'+ path +'">');
        $('.static-data #filename').text(filename);
        $('.static-data #file-dimensions').text(dimensions);

        $('.dynamic-data #url').val(path);
        $('.dynamic-data #title').val(title);
        $('.dynamic-data #desc').val(desc);
        $('.dynamic-data #full-image-link').attr('href', path);
        $('.dynamic-data #year').val(year);
        $('.dynamic-data #credits').val(credits);
        console.log('4');

        var clicked = false;
        $('.save-changes').click(function () {
            if (!clicked) {
                clicked = true;
                var title = $('.dynamic-data #title').val();
                var desc = $('.dynamic-data #desc').val();
                var year = $('.dynamic-data #year').val();
                var credits = $('.dynamic-data #credits').val();

                image.attr('desc', desc);
                image.attr('title', title);
                image.attr('year', year);
                image.attr('credits', credits);

                for(var i = 0; i < this_.images.length; i++) {
                    var j = this_.images[i];
                    if (j.id.toString() === id) {
                        j.title = title;
                        j.desc = desc;
                        j.year = year;
                        j.credits = credits;
                    }
                }

                this_.sendData(this_.dataJSON, this_.images);
            }
        });
        console.log('5');

        $('#' + this_.modalId).modal('show');
        console.log('6');
    });

    $('.on-image-controls > .fa-times').click(function() {
        $(this_).parents('.image-container').remove();
        var url = $(this).parents('.image-container')[0].children[0].children[1].children[0].src;
        for(var i = 0; i < this.images.length; i++) {
            var j = this.images[i];
            if (j.url === url) {
                this_.images.splice(j, 1);
            }
        }
        this_.sendData(this_.dataJSON, this_.images);
    });
};

$(window).resize(function() {
    var imageColumns = Math.round($(this.manager).width() / 145);
    $(this.manager).attr('data-image-columns', imageColumns);
});

Galery.prototype.init = function() {
    $('[data-toggle="tooltip"]').tooltip();
    var imageColumns = Math.round($(this.manager).width() / 145);
    $(this.manager).attr('data-image-columns', imageColumns);
    this.addModalDialog();
    this.addForm();
    this.dropzoneInit();
    this.loadImages();
    this.makeSortable();
};

Galery.prototype.addForm = function () {
    var elem = '<div class="box" id="' + this.dropzoneId + '" method="post" action="' + this.uploadAction + '">' +
        '<strong>Choose a file</strong> or drag it here.' +
        '</div>';

    var temp = document.createElement('div');
    temp.innerHTML = elem;

    $('.container')[0].appendChild(temp.firstChild);
};

Galery.prototype.makeSortable = function() {
    var this_ = this;
    $(this.manager).sortable({
        handle: '.fa-arrows',
        helper: 'clone',
        items: '> .image-container',
        placeholder: 'image-container image-placeholder',
        tolerance: 'pointer',
        start: function(event, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.html('<div class="inner-placeholder"></div>');
            this.prevIndex = ui.item.index();
        },
        stop: function (event, ui) {
            var index = ui.item.index();
            var ids = this_.ids;
            console.log(this_.ids);
            var prevIndex = this.prevIndex;
            console.log(ids);
            
            if (index !== prevIndex) {
                var temp = ids[prevIndex];
                if (prevIndex > index) {
                    for (var i = prevIndex - 1; i >= index; i--)
                        ids[i + 1] = ids[i];
                    ids[index] = temp;
                } else {
                    for (var i = prevIndex; i < index; i++)
                        ids[i] = ids[i + 1];
                    ids[index] = temp;
                }
                console.log(ids);

                var newImgs = new Array(this_.images.length);
                for(var i = 0; i < ids.length; i++)
                    for(var j = 0; j < this_.images.length; j++)
                        if (this_.images[j].id === ids[i])
                            newImgs[i] = this_.images[j];

                this_.sendData(this_.dataJSON, newImgs);
            }
        }
    });
};

Galery.prototype.addModalDialog = function() {
    var elem = "<div class=\"modal fade\" id=\"" + this.modalId + "\" tabindex=\"-1\" role=\"dialog\">\n" +
        "    <div class=\"modal-dialog modal-lg\" role=\"document\">\n" +
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n" +
        "                <h4 class=\"modal-title\">Details for image</h4>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\">\n" +
        "                <div id=\"image-preview-modal\"></div>\n" +
        "                <div class=\"row image-data-row\">\n" +
        "                    <div class=\"col-sm-4 static-data\">\n" +
        "                        <ul class=\"file-info-list\">\n" +
        "                            <li><strong>File name:</strong> <span id=\"filename\"></span></li>\n" +
        "                            <li><strong>File type:</strong> <span id=\"file-extension\"></span></li>\n" +
        "                            <li><strong>File size:</strong> <span id=\"filesize\"></span></li>\n" +
        "                            <li><strong>Dimensions:</strong> <span id=\"file-dimensions\"></span></li>\n" +
        "                        </ul>\n" +
        "                    </div>\n" +
        "                    <div class=\"col-sm-8 dynamic-data\">\n" +
        "                        <form class=\"form-horizontal\">\n" +
        "                            <div class=\"form-group\">\n" +
        "                                <label for=\"url\" class=\"col-sm-2 control-label\">URL</label>\n" +
        "                                <div class=\"col-sm-10\">\n" +
        "                                    <input type=\"text\" class=\"form-control\" id=\"url\" disabled>\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                            <div class=\"form-group\">\n" +
        "                                <label for=\"title\" class=\"col-sm-2 control-label\">Title</label>\n" +
        "                                <div class=\"col-sm-10\">\n" +
        "                                    <input type=\"text\" class=\"form-control\" id=\"title\" placeholder=\"Title\">\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                            <div class=\"form-group\">\n" +
        "                                <label for=\"desc\" class=\"col-sm-2 control-label\">Description</label>\n" +
        "                                <div class=\"col-sm-10\">\n" +
        "                                    <input type=\"text\" class=\"form-control\" id=\"desc\">\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                            <div class=\"form-group\">\n" +
        "                                <label for=\"year\" class=\"col-sm-2 control-label\">Year</label>\n" +
        "                                <div class=\"col-sm-10\">\n" +
        "                                    <input type=\"text\" class=\"form-control\" id=\"year\">\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                            <div class=\"form-group\">\n" +
        "                                <label for=\"credits\" class=\"col-sm-2 control-label\">Credits</label>\n" +
        "                                <div class=\"col-sm-10\">\n" +
        "                                    <input type=\"text\" class=\"form-control\" id=\"credits\">\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </form>\n" +
        "                        <div class=\"text-right\">\n" +
        "                            <a href=\"\" target=\"blank\" id=\"full-image-link\">Preview on new tab</a>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n" +
        "                <button type=\"button\" class=\"btn btn-primary save-changes\" data-dismiss=\"modal\">Save Changes</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";

    var temp = document.createElement('div');
    temp.innerHTML = elem;

    document.body.appendChild(temp.firstElementChild);
};

Galery.prototype.sendData = function(inputId, data) {
    var node = $('#' + inputId)[0];
    console.log(node);
    node.value = JSON.stringify(data);
};

Galery.prototype.loadImages = function() {
    $('#' + this.dataJSON)[0].value = this.imagesJSON;
    this.images = JSON.parse(this.imagesJSON);
    var prim = $('#' + this.preview)[0].value;

    for (var i in this.images) {
        var t = false;
        if (this.images[i].url === prim)
            t = true;
        this.addElement(this.images[i], t);
    }

    $('.image-container').each(function () {
        var a = $(this).find('img');
        if ($(this).find('img').width() > $(this).find('img').height()) {
            $(this).addClass('landscape');
        } else if ($(this).find('img').width() < $(this).find('img').height()) {
            $(this).addClass('portrait');
        } else {
            $(this).addClass('square');
        }
    });

    for (var i = 0; i < this.images.length; i++)
        this.ids.push(this.images[i].id);

    this.setListener();
};

/*function sendAll() {
    var form = document.createElement("form");
    form.method = "POST";
    form.action = "/this.images";
    form.appendChild(dataJSON.cloneNode());
    dataJSON.name = "data";
    form.appendChild(preview.cloneNode());
    preview.name = "preview";
    form.submit();
}

$(window).unload(function () {
    sendAll();
});*/