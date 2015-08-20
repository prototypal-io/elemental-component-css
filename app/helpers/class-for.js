import Ember from 'ember';

export default Ember.Helper.helper(function classFor(params) {
  let component = params[0];
  let className = params[1];
  return component.componentStyle.prefixClass(className);
});
