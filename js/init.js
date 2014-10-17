(function () {
  'use:strict';

  var FireJS = window.FireJS, $q = window.$q, $$ = window.$$;


  FireJS.sandSlide = new FireJS.SandboxSlider({
    el: $q('.outerslider'),
    test: function () {
      console.log('test');
    }
  });

  //console.log(this.siblings(el));

})();