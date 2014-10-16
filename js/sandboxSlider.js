(function () {
  'use strict';

  var FireJS = window.FireJS, $q = window.$q;

  FireJS.SandboxSlider = function (options) {
    if(options) this.loop(options, this);
    this.init;
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
      console.log(e.type);
      var delegate = {
        touchstart: this.tap,
        touchmove: this.move,
        touchend: this.release
      },
      func = delegate[e.type];
      if (func) func.call(this.e);
    },



    tap: function(e) {
      alert('touchstart');
    },
    move: function(e){
      alert('touchmove');
    },
    release: function(e){
      alert('touchend');
    }

  });



})();