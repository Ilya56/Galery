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

$(function () {
    var mdz = new Dropzone("#dz");
    mdz.on('success', function (file, res) {
        console.log(res);

        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
        $('.label-start').remove();

        if (res.success_) {
            ids.push(res.toAdd.id);
            addElement(res.toAdd);
        }
    });
});

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

    $('.product-image-manager')[0].appendChild(temp.firstChild);

    setListener();
}

var prevIndex;
var ids = [];

$(document).ready(function() {
    var manager = $('.product-image-manager');

    $('[data-toggle="tooltip"]').tooltip();

    var imageColumns = Math.round($('.product-image-manager').width() / 145);
    $('.product-image-manager').attr('data-image-columns', imageColumns);

    manager.sortable({
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

                var ajaxData = new FormData();
                ajaxData.append('ids', ids);

                // ajax request
                var ajax = new XMLHttpRequest();
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

                ajax.send(ajaxData);
            }
        }
    });
});

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
            if(this.readyState == this.DONE) {
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

        $('#file-modal').modal('show');

        var clicked = false;
        $('#save-changes').click(function () {
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

                var xhr1 = new XMLHttpRequest();
                var params = "id=" + id + "&title=" + title + "&desc=" + desc + "&year=" + year + "&credits=" + credits;
                xhr1.open("POST", "/info?" + params, true);
                xhr1.send();

                console.log('send');
            }
        });
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
});

$(window).resize(function() {
    var imageColumns = Math.round($('.product-image-manager').width() / 145);
    $('.product-image-manager').attr('data-image-columns', imageColumns);
});

var label = document.querySelector('label');
