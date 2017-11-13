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
    var form = document.querySelector( '.box' );
    var input = $('#fileupload');
    var label = form.querySelector( 'label' );
    var files;

    var $navContainer = $('#ocim-nav'),
        $navDefault = $('#ocim-nav-default'),
        $navSelected = $('#ocim-nav-img-selected'),
        $navForm = $('#ocim-nav-menu-form'),
        $navButtons = $('#ocim-form-btn-finish'),
        $imgListWrapper = $('#ocim-image-list-wrapper'),
        $imgList = $('#ocim-image-list'),
        $imgFormWrapper = $('#ocim-image-form-wrapper'),
        $imgFormStep2 = $('#ocim-form-step-2'),
        $imgCropFields = $('#ocim-image-crop-fields'),
        $imgFormBtnUpload = input,
        $imgPreview = $('#ocim-image-preview'),
        $imgDataWidth = $('#ocim-image-crop-width'),
        $imgDataHeight = $('#ocim-image-crop-height'),
        $cropSizeButtons = $('.ocim-crop-size-btn'),
        $cropSizeButtonLabel = $('#ocim-crop-sizes-btn-lbl'),
        $cropOptionsButtons = $('.ocim-crop-options-btn'),
        $cropCheckboxSaveCrop = $('#ocim-image-crop-save-size'),
        $buttonCrop = $('#ocim-image-crop-btn'),
        $buttonSetCropSize = $('#ocim-image-crop-set-size'),
        $croppedImagesWrapper = $('#ocim-cropped-images-wrapper'),
        $croppedImagesToggle = $('#ocim-cropped-images-toggle'),
        $croppedItemsList = $('#ocim-cropped-images-list'),
        $croppedItems = $('.ocim-cropped-image'),
        $croppedItemButtonDelete = $('.ocim-cropped-image-delete'),
        $buttonFinish = $('.ocim-form-btn-save'),
        imageTitle = $('#image-title'),
        imageDesc = $('#image-desc'),
        imageYear = $('#image-year'),
        imageCredit = $('#image-credits'),
        $formMetaInfoFileName = $('#ocim-file-info-file-name'),
        $formMetaInfoFileSize = $('#ocim-file-info-file-size'),
        $formMetaInfoFileType = $('#ocim-file-info-file-type'),
        $formMetaInfoFileRes = $('#ocim-file-info-file-res'),
        $formMetaInfoFileCrops = $('#ocim-file-info-file-crops'),
        scaleX = 1,
        scaleY = 1,
        imgWidth = 0,
        imgHeight = 0,
        cropSizeSet = false,
        freeCrop = true,
        cropsizes = []
    ;

    var init = function () {
        $('[data-toggle="tooltip"]').tooltip();
        initUploadEvent();
        initHandleButtons();
        initFormButtons();
    };

    var initUploadEvent = function () {
        $imgFormBtnUpload.change(function (e) {
            var that = this;
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
            } else {
                console.log('arquivo inválido');
            }
        });
    };

    function loadImageUploadForm (fileData, evt) {
        var src = evt.target.result;
        files = src;

        fillImageInfo(fileData, src);

        $imgPreview.attr('src', src);
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

    var showUploadForm = function () {
        $('.ocim-image-list-wrapper').css('display', 'none');
        $imgFormWrapper.addClass('ocim-active');
        //$navForm.addClass('ocim-active').siblings().removeClass('ocim-active');
    };

    var initHandleButtons = function () {
            triggerFormSubmit = function()
            {
                var event = document.createEvent( 'HTMLEvents' );
                event.initEvent( 'submit', true, false );
                form.dispatchEvent( event );
            };
        $navButtons.click(function( e ) {
            console.log("upload");
            triggerFormSubmit();
        });
    };

    var initFormButtons = function () {
        $('body').on('click', $cropOptionsButtons.selector, function (e) {
            e.preventDefault();
            var action = $(this).attr('rel');

            switch (action) {
                case 'rotate':
                    var value = parseInt($(this).attr('data-value'));
                    $imgPreview.cropper('rotate', value);
                    break;

                case 'invert':
                    var value = $(this).attr('data-value');

                    if(value == 'horizontal') {
                        $imgPreview.cropper('scale', -scaleX, scaleY);
                        scaleX = -scaleX;
                    } else {
                        $imgPreview.cropper('scale', scaleX, -scaleY);
                        scaleY = -scaleY
                    }
                    break;
            }
        });

        $('body').on('click', $cropSizeButtons.selector, function (e) {
            e.preventDefault();
            var ratio = $(this).attr('rel');

            $cropSizeButtonLabel.html(ratio);

            switch (ratio) {
                case 'free':
                    cropSizeSet = false;
                    freeCrop = true;
                    $imgPreview.cropper('setAspectRatio', NaN);
                    $imgCropFields.addClass('ocim-active');
                    break;

                default:
                    var dimensions = ratio.split('x');
                    imgWidth = parseInt(dimensions[0]);
                    imgHeight = parseInt(dimensions[1]);
                    var aspectRatio = imgWidth / imgHeight;
                    freeCrop = false;

                    $imgPreview.cropper('setAspectRatio', aspectRatio);
                    $imgCropFields.removeClass('ocim-active');
                    break;
            }
        });

        $('body').on('click', $buttonSetCropSize.selector, function (e) {
            e.preventDefault();
            imgWidth = parseInt($imgDataWidth.val());
            imgHeight = parseInt($imgDataHeight.val());
            var aspectRatio = imgWidth / imgHeight;
            cropSizeSet = true;

            $imgPreview.cropper('setAspectRatio', aspectRatio);
        });

        $('body').on('click', $buttonCrop.selector, function (e) {
            e.preventDefault();
            cropImage();
        });

        $('body').on('click', $croppedImagesToggle.selector, function (e) {
            e.preventDefault();
            $croppedImagesWrapper.toggleClass('ocim-show');
        });

        $('body').on('click', $croppedItemButtonDelete.selector, function (e) {
            e.preventDefault();

            var $btn = $(this);
            var $container = $btn.closest($croppedItems.selector);

            util.modalConfirm('Delete this crop?', function () {
                $container.fadeOut(200, function() {
                    $container.remove();
                    if($($croppedItemsList.selector + '>div').length == 0) {
                        $croppedImagesWrapper.removeClass('ocim-active');
                        $croppedImagesWrapper.removeClass('ocim-show');
                    }
                });
            });
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

    $(document).ready(function () {
        init();
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
            var filesize;
            var dimensions = image.get(0).naturalWidth + ' x ' + image.get(0).naturalHeight;
            var altText = image.attr('alt');
            var title = image.attr('title');

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
            //$('.static-data #file-extension').text('image/' + extension);
            $('.static-data #file-dimensions').text(dimensions);

            $('.dynamic-data #url').val(path);
            $('.dynamic-data #title').val(title);
            $('.dynamic-data #alt').val(altText);
            $('.dynamic-data #full-image-link').attr('href', path);

            $('#file-modal').modal('show');
        });

        $('.on-image-controls > .fa-times').click(function() {
            $(this).parents('.image-container').remove();
        });
    }

    form.addEventListener( 'submit', function( e )
    {
        // preventing the duplicate submissions if the current one is in progress
        if( form.classList.contains( 'is-uploading' ) ) return false;

        form.classList.add( 'is-uploading' );
        form.classList.remove( 'is-error' );
        e.preventDefault();

        // gathering the form data
        var ajaxData = new FormData(form);
        ajaxData.append('title', imageTitle.val());
        ajaxData.append('desc', imageDesc.val());
        ajaxData.append('year', imageYear.val());
        ajaxData.append('credits', imageCredit.val());

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
                    ids.push(data.toAdd.id);
                }

                addElement(data.toAdd);
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
