// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://alpha.taustation.space/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// ==/UserScript==

(function() {
    jQuery.fn.highlight = function(pat) { // from http://johannburkard.de/resources/Johann/jquery.highlight-5.js
        function innerHighlight(node, pat) {
            var skip = 0;
            if (node.nodeType == 3) {
                var pos = node.data.toUpperCase().indexOf(pat);
                pos -= (node.data.substr(0, pos).toUpperCase().length - node.data.substr(0, pos).length);
                if (pos >= 0) {
                    var spannode = document.createElement('span');
                    $(spannode).css({color: 'yellow'});
                    var middlebit = node.splitText(pos);
                    var endbit = middlebit.splitText(pat.length);
                    var middleclone = middlebit.cloneNode(true);
                    spannode.appendChild(middleclone);
                    middlebit.parentNode.replaceChild(spannode, middlebit);
                    skip = 1;
                }
            }
            else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                for (var i = 0; i < node.childNodes.length; ++i) {
                    i += innerHighlight(node.childNodes[i], pat);
                }
            }
            return skip;
        }
        return this.length && pat && pat.length ? this.each(function() {
            innerHighlight(this, pat.toUpperCase());
        }) : this;
    };

    var IS_ZTAU_DISABLED = Cookies.get('ztau_disabled') == 'true';

    add_missing_discreet();
    expand_discreet_text();
    highlight_locations();
    hide_unwanted();
    add_people_tabs();
    go_to_hotel();
    add_extra_nav();
    add_ztau_disabler();
    setup_search_for_people();

    function add_extra_nav() {
        if (IS_ZTAU_DISABLED) return;
        $('#game_navigation_areas ul').prepend(
              '<li><a href="/travel/area/electronic-market">♥ Public Market</a></li>'
            + '<li><a href="/area/electronic-market/page/1?filter=ration">♥ Rations Market</a></li>'
            + '<li><a href="/travel/area/lounge">♥ Lounge</a></li>'
        );
    }

    function go_to_hotel() {
        if (IS_ZTAU_DISABLED) return;
        $('#game_navigation_areas ul').prepend(
            '<li><a href="#" id="go_to_hotel">♥ Go to hotel</a></li>'
        );
        $('#go_to_hotel').click(function(){
            window.location.href = '/area/hotel-rooms/enter-room';
        });
        if (
               $('[href="/area/hotel-rooms/enter-room"]').length
            && $('[href="/area/hotel-rooms/enter-room"]').text() == 'Go to your hotel room'
            && (Cookies.get('ztau_people') === undefined)
        ) {
            console.log("Clicking");
            window.location.href = '/area/hotel-rooms/enter-room';
        }
    }

    function add_ztau_disabler() {
        $('#game_navigation_areas ul').prepend(
            '<li><a href="#" id="disable_ztau">' + (IS_ZTAU_DISABLED ? 'Enable' : 'Disable') + ' ZTAU</a></li>'
        );
        $('#disable_ztau').click(function () {
            if (IS_ZTAU_DISABLED) {
                IS_ZTAU_DISABLED = false;
                Cookies.set('ztau_disabled', 'false');
                $(this).text('Disable ZTAU');
            }
            else {
                IS_ZTAU_DISABLED = true;
                Cookies.set('ztau_disabled', 'true');
                $(this).text('Enable ZTAU');
            }
        });
    }

    function add_people_tabs() {
        if (IS_ZTAU_DISABLED) return;
        $('#game_navigation_areas .area a').css({width: '70%'});
        $('#game_navigation_areas .area').each(function() {
            $(this).prepend(
                $('<a href="' + $(this).find('a').attr('href') + '#/people">[people]</a>')
                .css({float: 'left'})
            );
        });
    }

    function hide_unwanted() {
        if (IS_ZTAU_DISABLED) return;
        $('.clear-mission-history').hide();
        $('.bond-to-credits').hide();
    }

    function highlight_locations() {
        if (IS_ZTAU_DISABLED) return;
        $(['Bank', 'Brig', 'Clones', 'Ship Breaking', 'Gov\'t Center', 'Inn',
          'Market', 'Port', 'Residences', 'Ruins', 'Security', 'Shipyard', 'Employment',
          'Sick Bay', 'Gym', 'Gaule Embassy', 'Water Plant', 'University']).each(function(i, el) {
            $('.narrative-direction').highlight(el);
        });
    }

    function expand_discreet_text() {
        if (IS_ZTAU_DISABLED) return;
        if ($('h3.mission-title').text() != 'Anonymous') return;
        highlight_locations();

        var is_out_of_focus = false;
        $('.narrative-direction p').each(function() {
            if ($(this).text() == 'You\'re too tired to do this, refresh your focus.')
                is_out_of_focus = true;
        });
        if (is_out_of_focus) {
            setTimeout(function() { expand_discreet_text(); }, 20000);
            return;
        }

        if (! $('.mission-action .mission-step-link').length) {
            setTimeout(function() { expand_discreet_text(); }, 2000);
            return;
        }
        setTimeout(function() {
            $('.mission-action .mission-step-link').click();
            setTimeout(function() { expand_discreet_text(); }, 600);
        }, 500);
    }

    function add_missing_discreet() {
        if (IS_ZTAU_DISABLED) return;
        if ($('[href="/travel/area/discreet-work"]').length) return;
        $('#employment_panel ul:first-child li:first-child').append(
            '<div><a href="/travel/area/discreet-work">Find discreet work</a></div>'
        );
    }

    function clear_search_for_people() {
        Cookies.set('prev_ztau_people', Cookies.get('ztau_people'));
        Cookies.remove('ztau_people');
        $('#people-unsearch').remove();
    }

    var people = [
        { url: '/travel/area/bank', type: 'all' },
        { url: '/travel/area/brig', type: 'all' },
        { url: '/travel/area/clonevat', type: 'try' },
        { url: '/travel/area/decommissioned-area', type: 'try' },
        { url: '/travel/area/gaule-embassy', type: 'try' },
        { url: '/travel/area/government-center', type: 'try' },
        { url: '/travel/area/inn', type: 'try' },
        { url: '/travel/area/bar', type: '/travel/area/inn' },
        { url: '/travel/area/hotel-rooms', type: '/travel/area/inn' },
        { url: '/travel/area/lounge', type: '/travel/area/inn' },
        { url: '/travel/area/job-center', type: 'try' },
        { url: '/travel/area/career-advisory', type: '/travel/area/job-center' },
        { url: '/travel/area/side-jobs', type: '/travel/area/job-center' },
        { url: '/travel/area/discreet-work', type: '/travel/area/job-center' },
        { url: '/travel/area/market', type: 'try' },
        { url: '/travel/area/vendors', type: '/travel/area/market' },
        { url: '/travel/area/electronic-market', type: '/travel/area/market' },
        { url: '/travel/area/storage', type: '/travel/area/market' },
        { url: '/travel/area/port', type: 'all' },
        { url: '/travel/area/shipping-bay', type: '/travel/area/port' },
        { url: '/travel/area/docks', type: '/travel/area/port' },
        { url: '/travel/area/local-shuttles', type: '/travel/area/port' },
        //{ url: '/travel/area/interstellar-shuttles', type: '/area/port' },
        { url: '/travel/area/residences', type: 'try' },
        { url: '/travel/area/ruins', type: 'try' },
        { url: '/travel/area/security', type: 'try' },
        { url: '/travel/area/shipyard', type: 'try' },
        { url: '/travel/area/sickbay', type: 'try' },
        { url: '/travel/area/training', type: 'try' },
        { url: '/travel/area/university', type: 'try' }
    ];

    function search_for_people() {
        $('#game_navigation_areas ul').prepend(
            '<li><a href="#" id="people-unsearch">👫 STOP Search for people</a></li>'
        ).find('#people-unsearch').click(clear_search_for_people);

        var promise = new Promise(function(resolve, reject) {
            var interval;
            interval = setInterval(function() {
                console.log("trying to find people");
                if ($('#people-count-msg').length) {
                    console.log("found people");
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
            }, 300);
        });

        promise.then(function() {
            var stop = false;
            $('.tab-content-people h2').each(function() {
                var t = $(this).text().trim();
                if (t == 'Contacts' || t == 'Others') stop = true;
            });
            if (stop) clear_search_for_people();

            var pos = Cookies.get('ztau_people');
            if (pos === undefined) return;
            pos = parseInt(pos);

            for (var i = pos, l = people.length; i < l; i++) {
                var area = people[i];
                console.log(i + " " +  area);
                if (
                    area.type == 'all'
                    || (area.type == 'try' && $('[href="' + area.url + '"]').length)
                    || (area.type != 'try' && area.type != 'all' && $('[href="' + area.type + '"]').length)
                ) {
                    Cookies.set('ztau_people', parseInt(i)+1);
                    location.href = area.url + '#/people';
                    return;
                }
            }
            clear_search_for_people();
        }, function() {});
    }

    function setup_search_for_people() {
        if (IS_ZTAU_DISABLED) return;
        $('#game_navigation_areas ul').prepend(
              '<li><a href="#" id="people-search">👫 Search for people</a></li>'
            + '<li><a href="#" id="continue-people-search">👫 CONTINUE search for people</a></li>'
        ).find('#people-search').click(function() {
            Cookies.set('ztau_people', 1);
            Cookies.set('prev_ztau_people', 1);
            location.href = '/travel/area/bank#/people';
            search_for_people();
        }).end().find('#continue-people-search').click(function(){
            var pos = Cookies.get('prev_ztau_people') || 1;
            if (pos == 1) {
                Cookies.set('ztau_people', pos);
                location.href = '/travel/area/bank#/people';
                search_for_people();
            }
            else {
                Cookies.set('ztau_people', pos+1);
                search_for_people();
            }
        });

        if (! (Cookies.get('ztau_people') === undefined)) search_for_people();
    }
})();

