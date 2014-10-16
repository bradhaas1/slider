(function () {
  'use strict';
  var FireJS = window.FireJS, $q = window.$q;

  FireJS.Scroller = function (options) {
    if (options) this.loop(options, this);
    this.init();
  };

  FireJS.Scroller.prototype = new FireJS.Component({
    constructor: FireJS.Scroller,
    tapEvent: document.createEvent('Event'),
    threshold: 5,
    rate: 2,
    el: $q('.outer'),
    inner: $q('.inner'),
    directions: { landscape: 'X', portrait: 'Y' },
    init: function () {
      this.tapEvent.initEvent('tapEvent', true, true);
      this.counter = 0;
      this.offset = this.min = 0;
      this.timeConstant = 325;
      this.getDirection();
      this.getOverflow();
      window.addEventListener('resize', this, false);
    },
    update: function (offset) {
      this.getDirection();
      this.getOverflow();
      this.scroll(offset);
      this.checkOverscroll();
    },
    getDirection: function () {
      this.orientation = this.getOrientation();
      this.direction = this.directions[this.orientation];
      this.offset = 0;
      this.inner.style.webkitTransform = 'translateX(0)';
      this.inner.style.webkitTransform = 'translateY(0)';
      this.removeClass('x y');
      this.addClass(this.direction.toLowerCase());
      this.addClass('atStart');
    },
    getSlideOffset: function () {
      var active = $q('.thumbs div.active'),
        offsets = {
          X: active.offsetLeft,
          Y: active.offsetTop
        };

      console.log(offsets[this.direction]);

      return offsets[this.direction];
    },
    getOverflow: function () {
      var flows = {
        X: this.inner.scrollWidth - this.el.clientWidth + 20,
        Y: this.inner.scrollHeight - this.el.clientHeight + 20
      };
      this.max = flows[this.direction];
      this._getOverflow();
    },
    _getOverflow: function () {
      if (this.max) {
        this.on();
      } else {
        this.addClass('atStart');
        this.addClass('atEnd');
        this.off();
      }
    },
    off: function () {
      this.dont('touchstart touchmove touchend');
    },
    on: function () {
      this.when('touchstart touchmove touchend');
    },
    handleEvent: function (e) {
      var delegate = {
        touchstart: this.tap,
        touchmove: this.throttle,
        touchend: this.release,
        resize: this.refresh
      },
          func = delegate[e.type];
      if (func) func.call(this, e);
    },
    refresh: function () {
      var instance = this;
      var offset = this.getSlideOffset();
      setTimeout(function () {
        instance.update(offset);
      }, 250);
    },
    throttle: function (e) {
      if (this.counter % this.rate === 0)
        this.drag(e);
      this.counter++;
    },
    getPosition: function (e) {
      var direction = 'client' + this.direction;
      return e.targetTouches[0][direction];
    },
    scroll: function (movement) {
      this.underMin = movement < this.min;
      this.overMax = movement > this.max;
      this.offset = movement;
      this._scroll();
    },
    _scroll: function () {
      if (!this.underMin) this.removeClass('atStart');
      if (!this.overMax) this.removeClass('atEnd');
      this.inner.style.webkitTransition = 'none';
      this.inner.style.webkitTransform = 'translate' + this.direction + '(' + (-this.offset) + 'px)';
    },
    checkOverscroll: function () {
      if (this.overMax) {
        this.offset = this.max;
        this.addClass('atEnd');
      }

      if (this.underMin) {
        this.offset = this.min;
        this.addClass('atStart');
      }
      this.inner.style.webkitTransform = 'translate' + this.direction + '(' + (-this.offset) + 'px)';
    },
    trackTime: function () {
      var now = Date.now(),
          elapsed = now - this.timestamp,
          delta = this.offset - this.frame,
          v = 1000 * delta / (1 + elapsed);
      this._trackTime(now, v);
    },
    _trackTime: function (now, v) {
      this.timestamp = now;
      this.frame = this.offset;
      this.velocity = 0.8 * v + 0.2 * this.velocity;
    },
    autoScroll: function () {
      var elapsed = Date.now() - this.timestamp,
          delta = this.getDelta(elapsed);
      if (Math.abs(delta) > this.threshold) this._autoScroll(delta);
      this.checkOverscroll();
    },
    getDelta: function (elapsed) {
      var time = Math.exp(-elapsed / this.timeConstant);
      return -this.amplitude * time;
    },
    _autoScroll: function (delta) {
      var instance = this;
      this.scroll(this.target + delta);
      if (!this.underMin && !this.overMax)
        window.requestAnimationFrame(function () {
          instance.autoScroll();
        });
    },
    interval: function (func, duration, name) {
      var instance = this,
          start = new Date().getTime(),
          time = 0,
          elapsed = '0.0';
      this[name] = window.setTimeout(timer, duration);

      function timer() {
        time += duration;

        elapsed = Math.floor(time / duration) / 10;
        if (Math.round(elapsed) == elapsed) { elapsed += '.0'; }

        instance[func]();

        var diff = (new Date().getTime() - start) - time;
        instance[name] = window.setTimeout(timer, (duration - diff));
      }
    },
    tap: function (e) {
      var instance = this;
      this.reference = this.getPosition(e);
      this.velocity = this.amplitude = 0;
      this.frame = this.offset;
      this.timestamp = Date.now();
      if (FireJS.iAm.kindle.ratio > 1) {
        clearTimeout(this.ticker);
        this.interval('trackTime', 100, 'ticker');
      }
      this.tapTimeout = setTimeout(function () {
        instance.fireTap(e);
      }, 200);
      this._clear(e);
    },
    fireTap: function (e) {
      var instance = this;
      clearTimeout(instance.tapTimeout);
      this.tapTimeout = 0;
      e.target.dispatchEvent(this.tapEvent);
    },
    drag: function (e) {
      var position = this.getPosition(e),
          delta = this.reference - position;
      if (Math.abs(delta) > 2)
        this._drag(delta, position);
      this._clear(e);
    },
    _drag: function (delta, position) {
      var instance = this;
      clearTimeout(instance.tapTimeout);
      this.tapTimeout = 0;
      if (this.underMin || this.overMax) delta = delta * 0.25;
      this.reference = position;
      this.scroll(this.offset + delta);
    },
    release: function (e) {
      var instance = this;
      if (FireJS.iAm.kindle.ratio > 1)
        clearTimeout(instance.ticker);
      if (this.tapTimeout) this.fireTap(e);
      this.scroll(this.offset);
      if (Math.abs(this.velocity) > 10)
        this._release();
      this.checkOverscroll();
      this._clear(e);
    },
    _release: function () {
      var instance = this;
      this.amplitude = 0.8 * this.velocity;
      this.target = Math.round(this.offset + this.amplitude);
      this.timestamp = Date.now();
      window.requestAnimationFrame(function () {
        instance.autoScroll();
      });
    },
    _clear: function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

})();