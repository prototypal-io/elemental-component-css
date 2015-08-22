import Ember from 'ember';
const PATTERN = /\S+/g;

export default Ember.Helper.helper(function (params) {
  var component = params[0];
  var classString;
  if (params.length > 2) { // concat
    classString = params.slice(1).join('');
  } else {
    classString = ''+params[1];
  }
  if (classString && component.componentStyle) {
    var classes = component.componentStyle.classes;
    return classString.replace(PATTERN, function (className) {
      if (classes[className]) {
        return classes[className];
      }
      return className;
    });
  }
  return classString;
});
