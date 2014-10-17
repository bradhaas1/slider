(function () {
  'use:strict';

  var FireJS = window.FireJS, $q = window.$q, $$ = window.$$;


  FireJS.sandSlide = new FireJS.SandboxSlider({
    el: $q('.outerslider'),
    inner: $q('.innerslider'),
    thumbs: $$('.innerslider div[class*="thumb"] figure'),
    test: function () {
      console.log(FireJS.sandSlide.thumbs);
    },

  });

  //console.log(this.siblings(el));

})();