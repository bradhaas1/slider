(function () {
  'use strict';

  var FireJS = window.FireJS, $q = window.$q;

  FireJS.SandboxSlider = function (options) {
    if(options) this.loop(options, this);
    this.init();
  }

  FireJS.SandboxSlider.prototype = new FireJS.Component({
    init: function(){
      this.on();
    },
    constructor: FireJS.SandboxSlider,
    on: function () {
      this.when('touchstart touchmove touchend');
    },
    handleEvent: function (e) {
      var delegate = {
        touchstart: this.tap,
        touchmove: this.move,
        touchend: this.release
      },
      func = delegate[e.type];
      if (func) func.call(this, e);
    },

    tap: function(e) {      
      this.thumbs.forEach(function (thumb) {
        thumb.style.opacity = '0.5';
      });
      e.target.style.opacity = '1';

      e.preventDefault();
      log("touchstart.");
      var el = document.getElementsByTagName("canvas")[0];
      var ctx = el.getContext("2d");
      var touches = e.changedTouches;
      
    },
    move: function(e){

      this.inner.style.webkitTransform = 'translateX(-300px)';
      
    },
    release: function (e) {

    }

  });



})();