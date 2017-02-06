function init() {
    $('.js-start-btn').on('click', function() {
        switchViews();
    });

    $('.js-reset').on('click', function(e) {
        e.preventDefault();
        switchViews();
    })
}

function switchViews() {
    $('.js-start').toggleClass('overlay');
    $('.js-inputs').toggleClass('overlay');
}

$(document).ready(init);