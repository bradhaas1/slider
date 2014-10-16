(function() {
    'use strict';
    var FireJS = window.FireJS, $q = window.$q;

    //  Collection of functions that run once on load
    FireJS.IAm = function(options) {
        if (options) this.loop(options, this);
        if (this.constructor === FireJS.IAm && this.init) this.init();
    };

    //  Device detection and unveiling
    FireJS.IAm.prototype = new FireJS.Component({
        constructor: FireJS.IAm,
        el: document.body.parentElement,
        //  To distinguish emulators from devices
        mac: navigator.platform === 'MacIntel',
        veilTime: 999,
        veilStyles: {
            webkitTransitionProperty: 'opacity',
            webkitTransitionDelay:    '0s',
            webkitTransitionDuration: '1s'
        },
        kindles: {
            //  Gen 5
            KFOT:  { name: 'ot', category: '',    ratio: 1.0, correction: 0.7500000000 },
            KFTT:  { name: 'ta', category: '_ta', ratio: 1.0, correction: 1.0000000000 },
            KFJW:  { name: 'je', category: '_je', ratio: 1.0, correction: 1.5000000000 },

            //  Gen 6
            KFSOW: { name: 'so', category: '_ta', ratio: 1.5, correction: 0.6666666667},
            KFTHW: { name: 'th', category: '_je', ratio: 2.0, correction: 0.7500000000},
            KFAPW: { name: 'ap', category: '_ap', ratio: 2.0, correction: 1.0000000000},

            //  Gen 7
            KFARW: { name: 'ar', category: '_ta', ratio: 1.5, correction: 0.6666666667},
            KFASW: { name: 'as', category: '_ta', ratio: 1.5, correction: 0.6666666667},
            KFSAW: { name: 'sa', category: '_ap', ratio: 2.0, correction: 1.0000000000}
        },

        //  Loops the 'kindles' object to find a match in the User Agent
        init: function() {
            //  Identifies the type of Kindle
            this.kindle = this.whoami(this.kindles);
            //  Adds the Kindle's two letter name to the body
            this.addClass(this.kindle.name);
            this.addClass(this.kindle.category);
            if (this.addName) this.addStyleSheet(this.kindle.name);
            if (this.addCat) this.addStyleSheet(this.kindle.category);
            if (this.kindle.correction) this.scaleViewport();
            //  Transitions opacity of HTML element from 0 to 1
            this.unveil();
            window.addEventListener('resize', this, false);
            this.getOrientation();
            if (!this.kindle) this.alertLaptop();
        },
        scaleViewport: function() {
            var tag = $q('[name="viewport"]'),
                c = this.kindle.correction;
            if (!tag) return false;
            tag.content = 'initial-scale=' + c +
                          ', minimum-scale=' + c +
                          ', maximum-scale=' + c +
                          ', target-densityDpi=device-dpi';
        },
        whoami: function(obj) {
            for ( var o in obj )
                if ( obj.hasOwnProperty(o) )
                    if ( navigator.userAgent.search(o) > -1 )
                        return obj[o];
            return false;
        },
        addStyleSheet: function(target) {
            var tag = document.createElement('link');
            tag.href = 'css/' + target + '.css';
            tag.rel = 'stylesheet';
            document.head.appendChild(tag);
        },
        //  Adds the above transition properties to the HTML element
        //  and after 1 second sets the opacity to 100%
        unveil: function() {
            var instance = this;
            this.css(this.veilStyles);
            setTimeout(function() {
                instance.css({opacity: 1});
            }, this.veilTime);
        },
        handleEvent: function() {
            this.getOrientation();
        },
        alertLaptop: function() {
            window.alert('Warning! the page will not render correctly on a laptop. Turn on your mobile emulator to view the site.');
        }
    });
})();