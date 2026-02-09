function resizeInc() {
    document.body.style.zoom = (window.innerWidth / window.outerWidth);
    var cur = $('html').css('transform');

    var st = 1;
    if (cur != 'none') {
        cur = cur.replace('matrix(', '').replace(')', '');
        var vals = cur.split(',');
        st = vals[0];
    }
    if (parseFloat(st)  < 1) {
        var width = window.innerWidth / 2;
        $('html').css('transform-origin', width + 'px 0px')
    }
    else {
        $('html').css('transform-origin', '0px 0px')
    }

    $('html').css('transform', `scale(${parseFloat(st) + 0.1})`)
    //$('html').css('transform-origin', '0px 0px')
}
function resizeDec() {
    document.body.style.zoom = (window.innerWidth / window.outerWidth);
    var cur = $('html').css('transform');

    var st = 1;
    if (cur != 'none') {
        cur = cur.replace('matrix(', '').replace(')', '');
        var vals = cur.split(',');
        st = vals[0];
    }


    if ((parseFloat(st) - 0.1) < 1) {
        var width = window.innerWidth / 2;
        $('html').css('transform-origin', width + 'px 0px')
    }
    else {
        $('html').css('transform-origin', '0px 0px')
    }
    $('html').css('transform', `scale(${parseFloat(st) - 0.1})`)

}
function reset(){
    document.body.style.zoom =1;
    $('html').css('transform-origin','0px 0px');
    $('html').css('transform', `scale(1)`)
}


$(document).keydown(function (event) {
    if (event.ctrlKey == true && (event.which == '61' ||event.which == '48' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189')) {
        event.preventDefault();

        if (event.which == '107' || event.which == "187" || event.which == '61') {
            resizeInc();
        }
        else if(event.which=='48'){
            reset();
        }
        else {
            resizeDec()
        }

    }
});
document.addEventListener("mousewheel", function (event) {


    if (event.ctrlKey == true) {

        var direction = detectMouseWheelDirection(event);

        if (direction == "up") {
            resizeInc();
        }
        else {
            resizeDec();
        }
        event.preventDefault();
    }



}, { passive: false });
document.addEventListener("DOMMouseScroll", function (event) {


    if (event.ctrlKey == true) {

        var direction = detectMouseWheelDirection(event);

        if (direction == "up") {
            resizeInc();
        }
        else {
            resizeDec();
        }
        event.preventDefault();
    }



}, { passive: false });


function detectMouseWheelDirection(e) {
    var delta = null,
        direction = false
        ;
    if (!e) {
        e = window.event;
    }
    if (e.wheelDelta) {
        delta = e.wheelDelta / 60;
    } else if (e.detail) {
        delta = -e.detail / 2;
    }
    if (delta !== null) {
        direction = delta > 0 ? 'up' : 'down';
    }

    return direction;
}