angular.module('draggable', [])

.directive('ngDraggable', function() {
   return {
      link: function(scope, iElm, iAttrs, controller) {
         iElm.prop('draggable', true);
         console.log(iElm);
         iElm[0].ondragstart = function(evt) {
            evt.dataTransfer.setData('Text', 'blah');
         };

         iElm[0].ondrop = function(evt) {
            evt.preventDefault();
            console.log('adf');
         };
      }
   };
})

.directive('ngDropzone', function() {
   return {
      link: function(scope, iElm, iAttrs, controller) {
         iElm[0].ondragenter = function(evt) {
            console.log(evt.dataTransfer.getData('Text'));
         };
      }
   };
})

;
