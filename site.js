$.extend($.easing, {
    def: 'easeOutQuad',
    easeInOutExpo: function(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
});

(function($) {

    var settings;
    var disableScrollFn = false;
    var navItems;
    var navs = {},
        sections = {};

    $.fn.navScroller = function(options) {
        settings = $.extend({
            scrollToOffset: 170,
            scrollSpeed: 800,
            activateParentNode: true,
        }, options);
        navItems = this;

        //attatch click listeners
        navItems.on('click', function(event) {
            event.preventDefault();
            var navID = $(this).attr("href").substring(1);
            disableScrollFn = true;
            activateNav(navID);
            populateDestinations(); //recalculate these!
            $('html,body').animate({
                    scrollTop: sections[navID] - settings.scrollToOffset
                },
                settings.scrollSpeed, "easeInOutExpo", function() {
                    disableScrollFn = false;
                }
            );
        });

        //populate lookup of clicable elements and destination sections
        populateDestinations(); //should also be run on browser resize, btw

        // setup scroll listener
        $(document).scroll(function() {
            if (disableScrollFn) {
                return;
            }
            var page_height = $(window).height();
            var pos = $(this).scrollTop();
            for (i in sections) {
                if ((pos + settings.scrollToOffset >= sections[i]) && sections[i] < pos + page_height) {
                    activateNav(i);
                }
            }
        });
    };

    function populateDestinations() {
        navItems.each(function() {
            var scrollID = $(this).attr('href').substring(1);
            navs[scrollID] = (settings.activateParentNode) ? this.parentNode : this;
            sections[scrollID] = $(document.getElementById(scrollID)).offset().top;
        });
    }

    function activateNav(navID) {
        for (nav in navs) {
            $(navs[nav]).removeClass('active');
        }
        $(navs[navID]).addClass('active');
    }
})(jQuery);


$(document).ready(function() {

    $('nav li a').navScroller();

    //section divider icon click gently scrolls to reveal the section
    $(".sectiondivider").on('click', function(event) {
        $('html,body').animate({
            scrollTop: $(event.target.parentNode).offset().top - 50
        }, 400, "linear");
    });

    //links going to other sections nicely scroll
    $(".container a").each(function() {
        if ($(this).attr("href").charAt(0) == '#') {
            $(this).on('click', function(event) {
                event.preventDefault();
                var target = $(event.target).closest("a");
                var targetHight = $(target.attr("href")).offset().top
                $('html,body').animate({
                    scrollTop: targetHight - 170
                }, 800, "easeInOutExpo");
            });
        }
    });

});

jQuery("[data-thumbgrid]").thumbGrid();

jQuery.getJSON('https://api.github.com/repos/SchizoDuckie/DuckieTV/releases').then(function(result) {
    $('#version').html(result[0].tag_name);
    $('#date').html(new Date(result[0].published_at).toLocaleDateString());
    $("#releasenotes").html('<p style="text-align:left">' + marked(result[0].body) + '</p>');

    var isX64 = navigator.userAgent.search(/x86_64|x86-64|Win64|x64;|amd64|AMD64|WOW64|x64_64/) > -1;

    result[0].assets.map(function(release) {
        console.log(release.name);
        if (release.name.indexOf('debug') > -1) return;
        if (release.name.indexOf('linux') > -1 && release.name.indexOf(isX64 ? 'x64' : 'x32') > -1) {
            $('.download.linux').click(function() {
                console.log('clicked!');
                window.open(release.browser_download_url);
            });
            return;
        }
        if (release.name.indexOf('windows') > -1) {
            $('.download.windows').click(function() {
                window.open(release.browser_download_url);
            });
            return;
        }
        if (release.name.indexOf('mac') > -1) {
            $('.download.apple').click(function() {
                window.open(release.browser_download_url);
            });
            return;
        }
    });
    $('.download').css({
        'opacity': 1,
        'transform': 'scale(1)'
    });
    $('#loader').hide();
    $('#loaded').show();
    window.amtChangelog = 5;

    window.showChangeLog = function() {
        var changelogItems = $('.p-changelog li');
        for (var i = 0; i < changelogItems.length; i++) {
            if (i > window.amtChangelog) {
                $(changelogItems[i]).hide();
            } else {
                $(changelogItems[i]).show();
            }
        }
    }
    showChangeLog();

});
