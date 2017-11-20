var dropzoneId,
    uploadAction,
    manager,
    dataJSON,
    preview,
    acceptedFiles,
    imagesJSON,
    modalId;

var images;

function Galery(params) {
    uploadAction = params.uploadAction;
    manager = '#' + params.manager;
    dropzoneId = 'dz-' + params.manager;
    dataJSON = params.dataJSON;
    preview = params.preview;
    for(var i = 0; i < params.acceptedFiles.length; i++)
        params.acceptedFiles[i] = '.' + params.acceptedFiles[i];
    acceptedFiles = params.acceptedFiles.join(', ');
    imagesJSON = params.imagesJSON;
    modalId = 'file-modal-' + params.manager;

    init();
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

function dropzoneInit() {
    var mdz = new Dropzone('#' + dropzoneId, {
        acceptedFiles: acceptedFiles
    });
    mdz.on('success', function (file, res) {
        console.log(res);

        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
        $('.label-start').remove();
        $('.dz-preview').remove();

        if (res.success_) {
            ids.push(res.toAdd.id);
            addElement(res.toAdd);
            images.push(res.toAdd);
            sendData(dataJSON, images);
        }
    });
    mdz.on('error', function () {
        $('.dz-success-mark').remove();
        $('.dz-error-mark').click(function () {
            $('.label-start').remove();
            $('.dz-preview').remove();
        });
    });
    $('.dz-hidden-input')[0].accept = acceptedFiles;
}

function addElement(img, prim) {
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

    $(manager)[0].appendChild(temp.firstChild);

    setListener();
}

var prevIndex;
var ids = [];

function setListener() {
    $('.on-image-controls > .fa-check').click(function() {
        $('.image-container').removeClass('picked-as-primary');
        $(this).parents('.image-container').addClass('picked-as-primary');
        var url = $(this).parents('.image-container')[0].children[0].children[1].children[0].src;
        console.log(url.substr(url.indexOf('/', 8), url.length));
        sendData(preview, url.substr(url.indexOf('/', 8), url.length));
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

                for(var i = 0; i < images.length; i++) {
                    var j = images[i];
                    if (j.id.toString() === id) {
                        j.title = title;
                        j.desc = desc;
                        j.year = year;
                        j.credits = credits;
                    }
                }

                sendData(dataJSON, images);
            }
        });
        console.log('5');

        $('#' + modalId).modal('show');
        console.log('6');
    });

    $('.on-image-controls > .fa-times').click(function() {
        $(this).parents('.image-container').remove();
        var url = $(this).parents('.image-container')[0].children[0].children[1].children[0].src;
        for(var i = 0; i < images.length; i++) {
            var j = images[i];
            if (j.url === url) {
                images.splice(j, 1);
            }
        }
        sendData(dataJSON, images);
    });
}

$(window).resize(function() {
    var imageColumns = Math.round($(manager).width() / 145);
    $(manager).attr('data-image-columns', imageColumns);
});

function init() {
    $('[data-toggle="tooltip"]').tooltip();
    var imageColumns = Math.round($(manager).width() / 145);
    $(manager).attr('data-image-columns', imageColumns);
    addModalDialog();
    addForm();
    dropzoneInit();
    loadImages();
    makeSortable();
}

function addForm() {
    var elem = '<div class="box" id="' + dropzoneId + '" method="post" action="' + uploadAction + '">' +
        '<strong>Choose a file</strong> or drag it here.' +
        '</div>';

    var temp = document.createElement('div');
    temp.innerHTML = elem;

    $('.container')[0].appendChild(temp.firstChild);
}

function makeSortable() {
    $(manager).sortable({
        handle: '.fa-arrows',
        helper: 'clone',
        items: '> .image-container',
        placeholder: 'image-container image-placeholder',
        tolerance: 'pointer',
        start: function(event, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.html('<div class="inner-placeholder"></div>');
            prevIndex = ui.item.index();
        },
        stop: function (event, ui) {
            var index = ui.item.index();

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

                var newImgs = new Array(images.length);
                for(var i = 0; i < ids.length; i++)
                    for(var j = 0; j < images.length; j++)
                        if (images[j].id === ids[i])
                            newImgs[i] = images[j];

                sendData(dataJSON, newImgs);
            }
        }
    });
}

function addModalDialog() {
    var elem = "<div class=\"modal fade\" id=\"" + modalId + "\" tabindex=\"-1\" role=\"dialog\">\n" +
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
}

function sendData(inputId, data) {
    var node = $('#' + inputId)[0];
    console.log(node);
    node.value = JSON.stringify(data);
}

function loadImages() {
    $('#' + dataJSON)[0].value = imagesJSON;
    images = JSON.parse(imagesJSON);
    var prim = $('#' + preview)[0].value;

    for (var i in images) {
        var t = false;
        if (images[i].url === prim)
            t = true;
        addElement(images[i], t);
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

    for (var i = 0; i < images.length; i++)
        ids.push(images[i].id);

    setListener();
}

/*function sendAll() {
    var form = document.createElement("form");
    form.method = "POST";
    form.action = "/images";
    form.appendChild(dataJSON.cloneNode());
    dataJSON.name = "data";
    form.appendChild(preview.cloneNode());
    preview.name = "preview";
    form.submit();
}

$(window).unload(function () {
    sendAll();
});*/