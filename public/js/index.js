function Image(id, url, uploadedBy, uploadDate, uploadTo, title, alt) {
    this.id = id;
    this.url = url;
    this.uploadedBy = uploadedBy;
    this.uploadedDate = uploadDate;
    this.uploadedTo = uploadTo;
    this.title = title;
    this.alt = alt;
}
Image.prototype.toJSON = function () {
    return {
        id: this.id,
        url: this.url,
        upBy: this.uploadedBy,
        upDate: this.uploadedDate,
        upTo: this.uploadedTo,
        title: this.title,
        alt: this.alt
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
        "      <img src=" + img.url + ">\n" +
        "    </div>\n" +
        "  </div>\n" +
        "</div>";

    var temp = document.createElement('div');
    temp.innerHTML = elem;

    $('.product-image-manager')[0].appendChild(temp.firstChild);
}

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();

    var imageColumns = Math.round($('.product-image-manager').width() / 145);
    $('.product-image-manager').attr('data-image-columns', imageColumns);

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

    $('.product-image-manager').sortable({
        handle: '.fa-arrows',
        helper: 'clone',
        items: '> .image-container',
        placeholder: 'image-container image-placeholder',
        tolerance: 'pointer',
        start: function(event, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.html('<div class="inner-placeholder"></div>');

        },
        stop: function (event, ui) {

        }
    });

    $('.on-image-controls > .fa-times').click(function() {
        $(this).parent().find('.delete-confirm').addClass('active');
    });

    $('.on-image-controls > .delete-confirm').click(function() {
        $(this).parents('.image-container').remove();
    });

    $('.product-image-manager > .image-container > .inner-image-container > .on-image-controls').mouseleave(function() {
        $(this).find('.delete-confirm').removeClass('active');
    });
});

var imageGetted = false;
$(window).load(function() {
    if (!imageGetted) {
        var getImgsRequest = new XMLHttpRequest();
        getImgsRequest.open('GET', "/images", true);
        getImgsRequest.onload = function () {
            var images = JSON.parse(getImgsRequest.response);

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
        };

        getImgsRequest.send();

        imageGetted = true;
        /*var imageManager = $('.product-image-manager-outer-space');
        console.log(imageManager);
        var html = imageManager[0];
        console.log(html);
        var data = {html: html};
        console.log(data);
        var cache = [];
        var jsonImages = JSON.stringify(data, function (k, v) {
            if (typeof v === 'object' && v !== null) {
                if (cache.indexOf(v) !== -1) {
                    return;
                }
                cache.push(v);
            }
            return v;
        });
        console.log(jsonImages);*/
    }
});

$(window).resize(function() {
    var imageColumns = Math.round($('.product-image-manager').width() / 145);
    $('.product-image-manager').attr('data-image-columns', imageColumns);
});

/*$(window).unload(function() {
    var imageManager = $('.product-image-manager');
    var html = imageManager.outerHTML;
    var jsonImages = JSON.stringify({html: html});
    console.log(jsonImages);
});*/

var droppedFiles = [];

( function ( document, window, index )
{
    // feature detection for drag&drop upload
    var isAdvancedUpload = function()
    {
        var div = document.createElement( 'div' );
        return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
    }();


    // applying the effect for every form
    var forms = document.querySelectorAll( '.box' ); /*
    Array.prototype.forEach.call( forms, function( form )
    {
        // letting the server side to know we are going to make an Ajax request
        /var ajaxFlag = document.createElement( 'input' );

        var input		 = form.querySelector( 'input[type="file"]' ),
            label		 = form.querySelector( 'label' ),
            errorMsg	 = form.querySelector( '.box__error span' ),
            restart		 = form.querySelectorAll( '.box__restart' ),
            showFiles	 = function( files )
            {
                label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
            },
            triggerFormSubmit = function()
            {
                var event = document.createEvent( 'HTMLEvents' );
                event.initEvent( 'submit', true, false );
                form.dispatchEvent( event );
            };
        ajaxFlag.setAttribute( 'type', 'hidden' );
        ajaxFlag.setAttribute( 'name', 'ajax' );
        ajaxFlag.setAttribute( 'value', 1 );
        form.appendChild( ajaxFlag );

        // automatically submit the form on file select
        input.addEventListener( 'change', function( e ) {
            showFiles( e.target.files );
            triggerFormSubmit();
        });

        // drag&drop files if the feature is available
        if( isAdvancedUpload ) {
            form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

            [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event ) {
                form.addEventListener( event, function(e) {
                    // preventing the unwanted behaviours
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
            [ 'dragover', 'dragenter' ].forEach( function( event ) {
                form.addEventListener( event, function()
                {
                    form.classList.add( 'is-dragover' );
                });
            });
            [ 'dragleave', 'dragend', 'drop' ].forEach( function( event ) {
                form.addEventListener( event, function()
                {
                    form.classList.remove( 'is-dragover' );
                });
            });
            form.addEventListener( 'drop', function( e ) {
                droppedFiles.push(e.dataTransfer.files); // the files that were dropped
                showFiles( droppedFiles );
                triggerFormSubmit();
            });
            $('#fileupload').on('change', function() {
                droppedFiles.push($(this)[0].files);
                showFiles( droppedFiles );
                triggerFormSubmit();
            });
        }


        // if the form was submitted
        form.addEventListener( 'submit', function( e )
        {
            // preventing the duplicate submissions if the current one is in progress
            if( form.classList.contains( 'is-uploading' ) ) return false;

            form.classList.add( 'is-uploading' );
            form.classList.remove( 'is-error' );
            if( isAdvancedUpload ) // ajax file upload for modern browsers
            {
                e.preventDefault();

                // gathering the form data
                var ajaxData = new FormData( form );
                if( droppedFiles )
                {
                    Array.prototype.forEach.call( droppedFiles, function( file )
                    {
                        ajaxData.append('files', file );
                    });
                }

                // ajax request
                var ajax = new XMLHttpRequest();
                ajax.open( form.getAttribute( 'method' ), form.getAttribute( 'action' ), true );

                ajax.onload = function()
                {
                    form.classList.remove( 'is-uploading' );
                    if( ajax.status >= 200 && ajax.status < 400 )
                    {
                        console.log(ajax.response);
                        var data = JSON.parse( ajax.response);
                        console.log(data);
                        form.classList.add( data.success_ === true ? 'is-success' : 'is-error' );
                        if( !data.success_ )
                            errorMsg.textContent = data.error_;
                        else {
                            label.textContent = data.text_ === null ? "" : data.text;
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
            }
            else // fallback Ajax solution upload for older browsers
            {
                var iframeName	= 'uploadiframe' + new Date().getTime(),
                    iframe		= document.createElement( 'iframe' );

                $iframe		= $( '<iframe name="' + iframeName + '" style="display: none;"></iframe>' );

                iframe.setAttribute( 'name', iframeName );
                iframe.style.display = 'none';

                document.body.appendChild( iframe );
                form.setAttribute( 'target', iframeName );

                iframe.addEventListener( 'load', function()
                {
                    var data = JSON.parse( iframe.contentDocument.body.innerHTML );
                    form.classList.remove( 'is-uploading' );
                    form.classList.add( data.success === true ? 'is-success' : 'is-error' )
                    form.removeAttribute( 'target' );
                    if( !data.success ) errorMsg.textContent = data.error;
                    iframe.parentNode.removeChild( iframe );
                });
            }
        });


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

    });*/
}( document, window, 0 ));