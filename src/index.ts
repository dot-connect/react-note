import { EditorCore } from './EditorCore/Editor';

/*eslint-disable*/
console.error = (function() {
  let error = console.error;
  return function(exception) {
    if ((exception + '').indexOf('Warning: A component is `contentEditable`') != 0) {
      error.apply(console, arguments);
    }
  };
})();
/*eslint-enable*/

export  {
  EditorCore,
};
