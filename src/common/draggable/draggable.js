/**
 @ngdoc overview
 @name draggable

 @description
 Provides the basics for drag and dropping of items in an angular application.
 */
angular.module('draggable', [])

.directive('ngDraggable', function($parse) {
   /**
    Directive for stuff

    @ngdoc directive
    @name ngDraggable
    */
   return {
      link: function(scope, element, attrs, controller) {
         // Mark the item as draggable
         element.prop('draggable', true);

         // When the drag starts fill in the drag data on the event
         var func = $parse(attrs['ngDraggable']);
         element.bind('dragstart', function(event) {
            // Run the function inside a $scope.apply block so that if the
            // scope changes the scope will be reevaluated.
            var handled;
            scope.$apply(function() {
               var res = func(scope, {$event: event});
               handled = res !== false;
            });

            if (handled) {
               var clone = event.srcElement.cloneNode(true),
                   elm = angular.element(clone),
                   wrapper = angular.element('<div class="drag-image-wrapper"></div>');

               elm.addClass('drag-image');

               wrapper.append(elm);

               angular.element(document.body).append(wrapper);
               event.dataTransfer.setDragImage(wrapper[0], 0, 0);
            }

            return handled === false;
         });

         element.bind('dragend', function() {
            element.removeClass('dragging');
         });
      }
   };
})

.directive('ngDropzone', function($parse) {
   return {
      link: function(scope, element, attrs, controller) {
         var drag_type = 'move'; // Hardcoded for now since that is all I need

         var func = $parse(attrs['ngDropzone']);
         element.bind('dragenter', function(event) {
            // Defualt to drop not allowed
            var allow_drop = true;

            scope.$apply(function() {
               allow_drop = func(scope, {$event: event});
            });

            if (allow_drop) {
               event.dataTransfer.dropEffect = drag_type;

               // The event will continue propogating since we do not care
               // about the drop
               event.preventDefault();
            }

            return !allow_drop;
         });

         element.bind('dragover', function(event) {
            // Defualt to drop not allowed
            var allow_drop = false;

            scope.$apply(function() {
               allow_drop = func(scope, {$event: event});
            });

            if (allow_drop) {
               event.dataTransfer.dropEffect = drag_type;


               // The event will continue propogating since we do not care
               // about the drop
               if (allow_drop) {
                  event.preventDefault();
               }
            }

            return !allow_drop;
         });

         var doDropfunc = $parse(attrs['handledrop']);
         element.bind('drop', function(event) {
            var handled = false;

            scope.$apply(function() {
               var handled = doDropfunc(scope, {$event: event});
               // Allow the drop func to forget about the return value unless
               // they need to cancel the drop.
               // This is OK since the drop would not happen if the
               // dragenter/over methods had not succeeded.
               handled = (handled !== false);
               console.log('drop', handled);
            });

            if (handled) {
               event.preventDefault();
            }
            return !handled;
         });
      }
   };
})

;
