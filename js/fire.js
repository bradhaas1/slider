(function() {
    'use strict';
    //  Alias for document.querySelector
var $q = function(q, scope) {
        scope = scope || document;
        return scope.querySelector(q);
    },
    //  Queries and returns an array-like object
    //  that contains HTML elements
    $$ = function(q, scope) {
        var target;
        scope = scope || document;
        target = scope.querySelectorAll(q);
        return Array.prototype.slice.call(target, 0);
    },

    FireJS = {
        //  Base class from which all components inherit
        Component: function(options) {
            this.loop(options, this);
        }
    };

    window.FireJS = FireJS;
    window.$q = $q;
    window.$$ = $$;

    //  Utility functions
    FireJS.Component.prototype = {
        constructor: FireJS.Component,
        //  Adds an object's properties to the target
        loop: function(obj, target) {
            var keys = Object.keys(obj);
            target = target || this;
            keys.forEach(function(key) {
                target[key] = obj[key];
            });
            return target;
        },
        getJSON: function(url, callback) {
            var self = this,
                xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.addEventListener('load', load, false);
            xhr.addEventListener('error', this._error, false);
            xhr.addEventListener('abort', this._abort, false);
            xhr.send();

            function load(event) {
                if (xhr.readyState == 4) {
                    // JSON.parse does not evaluate the attacker's scripts.
                    var resp = JSON.parse(xhr.responseText);
                    callback.call(self, resp);
                }
            }
        },
        _error: function(event) {
            console.log('An error occurred while transferring the file.', event);
        },
        _abort: function(event) {
            console.log('The transfer has been canceled by the user.', event);
        },
        clone: function(obj) {
            return this.loop(obj, {});
        },
        //  Target is the last parameter so that it can be omitted.
        //  When omitted it target will default to this.el or this.els.
        divide: function(obj) {
            obj.target = this._getTarget(obj.target);
            this._divide(obj);
            //  The instance is returned to allow chaining of commands
            return this;
        },
        //  Underscore is a shorthand to indicate this is a helper function
        _divide: function(obj) {
            var instance = this,
                clone = this.clone(obj);
            obj.target.forEach(function(target){
                clone.target = target;
                obj.func.call(instance, clone);
            });
        },
        _getTarget: function(target) {
            target = target || this.el || this.els;
            if ( target instanceof(HTMLElement) ) target = [target];
            return target;
        },
        list: function(target) {
            return Array.prototype.slice.call(target, 0);
        },
        siblings: function(el, q) {
            if (q) return $$(q, el.parentElement);
            return this.list(el.parentElement.children);
        },
        parents: function(q, el) {
            if (!el.parentElement) return false;
            var obj = this.objectify(q, el);
            return this._parents(obj);
        },
        objectify: function(q, el) {
            var obj = {
                q: q, el: el,
                parent: el.parentElement
            };
            obj.els = this.siblings(obj.parent, q);
            obj.index = obj.els.indexOf(el);
            return obj;
        },
        _parents: function(obj) {
            if (obj.index > -1) return obj.el;
            else return this.parents(obj.q, obj.parent);
        },
        //  Adds a class to target, if target is omitted
        //  divide() will default to this.el or this.els
        addClass: function(klass, target) {
            var obj = {
                    func: this._class,
                    key: 'add',
                    val: klass,
                    target: target
                };
            return this.divide(obj);
        },
        removeClass: function(klass, target) {
            var obj = {
                    func: this._class,
                    key: 'remove',
                    val: klass,
                    target: target
                };
            return this.divide(obj);
        },
        hasClass: function(klass, target) {
            if (target.classList.contains(klass))
                return true;
        },
        //  Applies the css key value pairs of an object to a target
        css: function(styles, target) {
            var obj = {
                    func: this._css,
                    key: 'style',
                    val: styles,
                    target: target
                };
            return this.divide(obj);
        },
        index: function() {
            var types = {
                    number: this._getEl,
                    object: this._getNum
                },
                func = types[typeof arguments[0]];
            return func.apply(this, arguments);
        },
        _getEl: function() {
            var target = arguments[1] || this.el,
                index = arguments[0];
            return target.children[index];
        },
        _getNum: function(target) {
            var counter = 0;
            function getPrev(target) {
                // console.log(target)
                target = target.previousElementSibling;
                if (!target) return;
                counter++;
                getPrev(target);
            }
            getPrev(target);
            return counter;
        },
        //  Adds 1 or more event listeners to 1 or more HTML elements
        when: function(types, target) {
            var obj = {
                    func: this._listen,
                    key: 'addEventListener',
                    val: types,
                    target: target
                };
            return this.divide(obj);
        },
        //  Removes 1 or more event listeners to 1 or more HTML elements
        dont: function(types, target) {
            var obj = {
                    func: this._listen,
                    key: 'removeEventListener',
                    val: types,
                    target: target
                };
            return this.divide(obj);
        },
        data: function(name, target) {
            var data;
            target = target || this.el || this.els;
            data = target.dataset[name];
            if (data) return data;
        },
        //  Passes tracker data properties to a device level function
        track: function(el) {
            var number = this.data('track', el),
                label = this.data('trackLabel', el);
            if (label) number = number + ' | ' + label;
            if (window.evt) window.evt.clk(number);
            else window.console.log('KSO tracking:', number);
        },
        range: function(start, end) {
            var diff = end - start,
                arr = new Array(diff);
            return Array.apply(null, arr).map(function (_, i) {
                return i + start;
            });
        },
        getOrientation: function() {
            if (document.body.clientWidth > document.body.clientHeight)
                return 'landscape';
            else
                return 'portrait';
        },
        //  Helper for addClass() & removeClass()
        _class: function(obj) {
            if (!obj.val) return false;
            var names = obj.val.split(' ');
            names.forEach(function(n) {
                obj.target.classList[obj.key](n);
            });
        },
        //  Helper for css()
        _css: function(obj) {
            this.loop(obj.val, obj.target[obj.key]);
        },
        //  Helper for when() & dont()
        _listen: function(obj) {
            var eTypes = obj.val.split(' ');
            for ( var i = 0; i < eTypes.length; i++ ) {
                obj.target[obj.key](eTypes[i], this, true);
            }
        }
    };
})();
