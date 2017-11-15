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

function changeEvent(e, target) {
    var event = document.createEvent( 'HTMLEvents' );
    event.initEvent('change', e, false);
    console.log("change event");
    console.log(event);
    input.handleEvent(event);
}

$(window).resize(function() {
    var imageColumns = Math.round($('.product-image-manager').width() / 145);
    $('.product-image-manager').attr('data-image-columns', imageColumns);
});

var showFiles	 = function( files ) {
    label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
}, triggerFormSubmit = function() {
    var event = document.createEvent( 'HTMLEvents' );
    event.initEvent( 'submit', true, false );
    showUploadForm();
};

/*(function (document, window)
{
    // feature detection for drag&drop upload
    var isAdvancedUpload = function()
    {
        var div = document.createElement( 'div' );
        return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
    }();


    // applying the effect for every form
    var forms = document.querySelectorAll( '.box' );
    Array.prototype.forEach.call( forms, function( form )
    {
        var input		 = form.querySelector( 'input[id=fileupload]' ),
            label		 = form.querySelector( 'label' ),
            restart		 = form.querySelectorAll( '.box__restart' )

        // letting the server side to know we are going to make an Ajax request
        var ajaxFlag = document.createElement( 'input' );
        ajaxFlag.setAttribute( 'type', 'hidden' );
        ajaxFlag.setAttribute( 'name', 'ajax' );
        ajaxFlag.setAttribute( 'value', 1 );
        form.appendChild( ajaxFlag );

        // automatically submit the form on file select
        input.addEventListener( 'change', function( e )
        {
            showFiles(e.target.files);
            triggerFormSubmit();
        });

        // drag&drop files if the feature is available
        if( isAdvancedUpload )
        {
            form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

            [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
            {
                form.addEventListener( event, function( e )
                {
                    // preventing the unwanted behaviours
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
            [ 'dragover', 'dragenter' ].forEach( function( event )
            {
                form.addEventListener( event, function()
                {
                    form.classList.add( 'is-dragover' );
                });
            });
            [ 'dragleave', 'dragend', 'drop' ].forEach( function( event )
            {
                form.addEventListener( event, function()
                {
                    form.classList.remove( 'is-dragover' );
                });
            });
            form.addEventListener( 'drop', function( e )
            {
                /*droppedFiles = e.dataTransfer.files; // the files that were dropped
                e.files = e.dataTransfer.files;
                showFiles( droppedFiles );

                triggerFormSubmit();
                e.target = input;
                files = e.dataTransfer.files;
                console.log("form drop");
                console.log(e);
                changeEvent(e, input);
            });
        }

        // restart the form if has a state of error/success
        Array.prototype.forEach.call( restart, function( entry )
        {
            entry.addEventListener( 'click', function( e )
            {
                e.preventDefault();
                form.classList.remove( 'is-error', 'is-success' );
                input.click();
            });
        });

        // Firefox focus bug fix for file input
        input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
        input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

    });
}(document, window));*/

var showUploadForm = function () {
    $('.ocim-image-list-wrapper').css('display', 'none');
    $('#ocim-image-form-wrapper').addClass('ocim-active');
};

var form = document.querySelector( '.box' );
var input = form.querySelector('input[id=fileupload]');
var label = form.querySelector('label');
var files;

var btnFinish = $('#ocim-form-btn-finish'),
    btnNext = $('#ocim-form-btn-next'),
    $imgFormBtnUpload = input,
    imageTitle = $('#image-title'),
    imageDesc = $('#image-desc'),
    imageYear = $('#image-year'),
    imageCredit = $('#image-credits'),
    $formMetaInfoFileName = $('#ocim-file-info-file-name'),
    $formMetaInfoFileSize = $('#ocim-file-info-file-size'),
    $formMetaInfoFileType = $('#ocim-file-info-file-type'),
    $formMetaInfoFileRes = $('#ocim-file-info-file-res'),
    title = [],
    desc = [],
    year = [],
    cred = [],
    n = 0,
    nmax
;

var init = function () {
    $('[data-toggle="tooltip"]').tooltip();
    initUploadEvent();
    initHandleButtons();
};

var initUploadEvent = function () {
    $imgFormBtnUpload.addEventListener('change', function (e) {
        console.log("---");
        console.log(e);
        var that = this;
        files = this.files;
        if (this.files && this.files[0]) {
            if(validateImage(this.files[0])) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    loadImageUploadForm(that.files[0], e);
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                console.log('arquivo inválido');
            }


            var l = this.files.length;
            title = new Array(l);
            desc = new Array(l);
            year = new Array(l);
            cred = new Array(l);
            nmax = l;
            console.log(l);

        } else {
            console.log('arquivo inválido');
        }
    });
};

function loadImageUploadForm (fileData, evt) {
    var src = evt.target.result;

    fillImageInfo(fileData, src);

    showUploadForm();
}

var fillImageInfo = function (fileData, src) {
    imageTitle.html(fileData.name);

    $formMetaInfoFileName.html(fileData.name);
    $formMetaInfoFileSize.html(getFileSize(fileData.size));
    $formMetaInfoFileType.html(fileData.type);

    getImageOriginalResolution(src, function (res) {
        $formMetaInfoFileRes.html(res);
    });
};

var getImageOriginalResolution = function (src, callback) {
    var tmpImg = new Image();

    tmpImg.onload = function () {
        var width = tmpImg.width;
        var height = tmpImg.height;
        var dimensions = width + 'x' + height;

        callback(dimensions);
    };

    tmpImg.src = src;
};

var getFileSize = function (sizeBytes) {
    var suffix = '';
    var size = '';
    if(sizeBytes / (1000 * 1024) > 1) {
        size = (sizeBytes / (1000 * 1024)).toFixed(2);
        suffix = 'mb'
    } else if(sizeBytes / 1024 > 1) {
        size = (sizeBytes / 1024).toFixed(2);
        suffix = 'kb'
    } else {
        size = sizeBytes;
        suffix = 'bytes';
    }

    return size + suffix;
};

var initHandleButtons = function () {
    var triggerFormSubmit = function () {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('submit', true, false);
        form.dispatchEvent(event);
    };
    btnFinish.click(function(e) {
        triggerFormSubmit();
    });
    btnNext.click(function (e) {
        title[n] = imageTitle.val();
        desc[n] = imageDesc.val();
        year[n] = imageYear.val();
        cred[n] = imageCredit.val();
        n++;

        if (n === nmax) {
            triggerFormSubmit();
            return;
        }

        imageTitle.val('');
        imageDesc.val('');
        imageYear.val('');
        imageCredit.val('');

        if(validateImage(files[n])) {
            var reader = new FileReader();
            reader.onload = function (e) {
                loadImageUploadForm(files[n], e);
            };
            reader.readAsDataURL(files[n]);
        } else {
            console.log('arquivo inválido');
        }
    });
};

var validateImage = function (file) {
    var arrMimes = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];
    var maxSize = 10 * 1024 * 1024; //size in MB

    if (arrMimes.indexOf(file.type.toLowerCase()) < 0) {
        return false;
    }

    return file.size <= maxSize;
};


(function e(t,n,r){
    function s(o,u){
        if(!n[o]){
            if(!t[o]){
                var a=typeof require==="function"&&require;
                if(!u&&a)return a(o,!0);
                if(i)return i(o,!0);
                var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND", f
            }
            var l=n[o]={
                exports:{}
            };
            t[o][0].call(l.exports, function(e){
                    var n=t[o][1][e];
                    return s(n?n:e)
                },
                l,l.exports,e,t,n,r
            )
        }
        return n[o].exports
    }
    var i = typeof require==="function"&&require;
    for(var o=0; o<r.length; o++)
        s(r[o]);
    return s
})({1:[function(require, module, exports){
    var modalConfirm = function (msg, callbackYes, callbackNo) {
        htmlModal = '' +
            '<div id="modal-confirm" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modal-confirm-label" aria-hidden="true">' +
            ' <div class="modal-dialog">' +
            '   <div class="modal-content">' +
            '     <div class="modal-header">' +
            '       <h3 id="modal-confirm-label">Confirmation</h3>' +
            '     </div>' +
            '     <div class="modal-body">' +
            '       <p>' + msg + '</p>' +
            '     </div>' +
            '     <div class="modal-footer">' +
            '       <button id="btn-cancel" class="btn">Cancel</button>' +
            '       <button id="btn-confirm" class="btn btn-primary">Confirm</button>' +
            '     </div>' +
            '   </div>' +
            ' </div>' +
            '</div>';

        $('body').append($(htmlModal));
        $('#modal-confirm').modal('show');

        $('#btn-confirm').click(function(){
            callbackYes();
            $('#modal-confirm').modal('hide');
            $('#modal-confirm').on('hidden.bs.modal', function (e) {
                $('#modal-confirm').remove();
            })
        });

        $('#btn-cancel').click(function(){
            if(typeof callbackNo != 'undefined') {
                callbackNo();
            }
            $('#modal-confirm').modal('hide');
            $('#modal-confirm').on('hidden.bs.modal', function (e) {
                $('#modal-confirm').remove();
            })
        });
    };

    module.exports = {
        modalConfirm: modalConfirm
    };
},{}], 2:[function(require,module,exports){
    $(document).ready(function () {
        init();
    });

    form.addEventListener( 'submit', function( e )
    {
        // preventing the duplicate submissions if the current one is in progress
        if( form.classList.contains( 'is-uploading' ) ) return false;

        form.classList.add( 'is-uploading' );
        form.classList.remove( 'is-error' );
        e.preventDefault();

        // gathering the form data
        var ajaxData = new FormData(form);
        ajaxData.append('title', title);
        ajaxData.append('desc', desc);
        ajaxData.append('year', year);
        ajaxData.append('credits', cred);
        for(var i = 0; i < files.length(); i++)
            ajaxData.append('files', files[i]);

        // ajax request
        var ajax = new XMLHttpRequest();

        ajax.open( form.getAttribute( 'method' ), form.getAttribute( 'action' ), true );

        console.log(ajax);

        ajax.onload = function()
        {
            form.classList.remove( 'is-uploading' );

            $('.ocim-image-list-wrapper').css('display', 'block');
            $('#ocim-image-form-wrapper').css('display', 'none');

            if( ajax.status >= 200 && ajax.status < 400 )
            {
                console.log(ajaxData);
                console.log(ajax.response);
                var data = JSON.parse( ajax.response);
                console.log(data);
                form.classList.add( data.success_ === true ? 'is-success' : 'is-error' );
                if( !data.success_ )
                    errorMsg.textContent = data.error_;
                else {
                    label.textContent = data.text_ === null ? "" : data.text;
                    setTimeout(function () {
                        form.classList.remove( 'is-error', 'is-success' );
                        label.textContent = "Upload more";
                    }, 3000);
                    ids.push(data.toAdd.id);
                }

                var arr;
                if (Array.isArray(data.toAdd)) {
                    arr = data.toAdd;
                } else {
                    arr = [data.toAdd];
                }
                arr.forEach(function (t) {
                    addElement(t)
                });
            }
            else alert( 'Error. Please, contact the webmaster!' );
        };

        ajax.onerror = function()
        {
            form.classList.remove( 'is-uploading' );
            alert( 'Error. Please, try again!' );
        };

        ajax.send(ajaxData);
    });
},{"./functions":1}]},{},[2]);
