var modalId,
formId,
formAction,
manager,
dataJSON,
preview;

function Galery(params) {
    modalId = params.modalId;
    formId = params.formId;
    formAction = params.formAction;
    manager = params.manager;
    dataJSON = params.dataJSON;
    preview = params.preview;

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
    var mdz = new Dropzone("#dz");
    mdz.on('success', function (file, res) {
        console.log(res);

        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
        $('.label-start').remove();
        $('.dz-preview').remove();

        if (res.success_) {
            ids.push(res.toAdd.id);
            addElement(res.toAdd);
        }
    });
}

function addElement(img) {
    var elem = "<div class=\"image-container\">\n" +
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
    });

    $('.on-image-controls > .fa-info-circle').click(function() {
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

        $('#image-preview-modal').html('<img src="'+ path +'">');
        $('.static-data #filename').text(filename);
        $('.static-data #file-dimensions').text(dimensions);

        $('.dynamic-data #url').val(path);
        $('.dynamic-data #title').val(title);
        $('.dynamic-data #desc').val(desc);
        $('.dynamic-data #full-image-link').attr('href', path);
        $('.dynamic-data #year').val(year);
        $('.dynamic-data #credits').val(credits);

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

                /*var xhr1 = new XMLHttpRequest();
                var params = "id=" + id + "&title=" + title + "&desc=" + desc + "&year=" + year + "&credits=" + credits;
                xhr1.open("POST", "/info?" + params, true);
                xhr1.send();*/

                var json = {
                    id: id,
                    title: title,
                    desc: desc,
                    year: year,
                    credits: credits
                };

                sendData(dataJSON, "POST", "info", json);
                sendData(preview, "POST", "info", json);
            }
        });

        $('#'+modalId).modal('show');
    });

    $('.on-image-controls > .fa-times').click(function() {
        $(this).parents('.image-container').remove();
    });
}

var imageGetted = false;
$(window).load(function() {
    if (!imageGetted) {
        var getImgsRequest = new XMLHttpRequest();
        getImgsRequest.open('GET', "/images", true);
        getImgsRequest.onload = function () {
            var images = JSON.parse(getImgsRequest.response);
            console.log(images.imgs);

            for (var i in images.imgs) {
                var j = images.imgs[i];
                addElement(j);
            }

            $('.image-container').each(function () {
                var a = $(this).find('img');
                console.log("--" + a.width() + " " + a.naturalWidth + " " + a.clientWidth + ' ' + a.availWidth);
                if ($(this).find('img').width() > $(this).find('img').height()) {
                    $(this).addClass('landscape');
                } else if ($(this).find('img').width() < $(this).find('img').height()) {
                    $(this).addClass('portrait');
                } else {
                    $(this).addClass('square');
                }
            });

            for (var i = 0; i < images.imgs.length; i++)
                ids.push(images.imgs[i].id);
            console.log(ids);

            setListener();
        };

        getImgsRequest.send();

        imageGetted = true;
    }

    iframe.style.display = "none";
    document.body.appendChild(iframe);
});

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
    makeSortable();
}

function addForm() {
    var elem = '<form class="box" id="' + formId + '" method="post" action="' + formAction + '" enctype="multipart/form-data">' +
        '<strong>Choose a file</strong> or drag it here.' +
        '</form>';

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
                console.log(ids);
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

                //var ajaxData = new FormData();
                //ajaxData.append('ids', ids);

                // ajax request
                /*var ajax = new XMLHttpRequest();
                ajax.open('post', '/images', true);

                ajax.onload = function () {
                    if (ajax.status >= 200 && ajax.status < 400) {
                        var data = JSON.parse(ajax.response);
                        if (!data.success_) {
                            alert('Error. Please, contact the webmaster!');
                        }
                    }
                    else alert('Error. Please, contact the webmaster!');
                };

                ajax.onerror = function () {
                    alert('Error. Please, try again!');
                };

                ajax.send(ajaxData);*/

                var json = {
                    ids: ids
                };

                console.log(json);
                sendData(dataJSON, "POST", "images", json);
                sendData(preview, "POST", "images", json);
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

var iframe = document.createElement("iframe");
iframe.name = "myTarget";

function sendData(inputId, method, action, data) {
    var name,
        form = document.createElement("form"),
        node = $('#' + inputId)[0];

    console.log(node);

    form.action = "/" + action;
    form.target = iframe.name;
    form.method = method;
    form.id = "templateForm";

    for(name in data) {
        node.name  = name;
        node.value = data[name].toString();
        form.appendChild(node.cloneNode());
    }

    form.style.display = "none";
    document.body.appendChild(form);

    form.submit();

    document.body.removeChild(form);
}
