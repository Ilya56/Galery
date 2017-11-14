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

    var btnFinish = $('#ocim-form-btn-finish'),
        btnNext = $('#ocim-form-btn-next'),
        $imgFormWrapper  = $('#ocim-image-form-wrapper'),
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
        $imgFormBtnUpload.change(function (e) {
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

    var showUploadForm = function () {
        $('.ocim-image-list-wrapper').css('display', 'none');
        $imgFormWrapper.addClass('ocim-active');
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
