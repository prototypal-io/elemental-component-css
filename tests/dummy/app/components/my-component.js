import Ember from 'ember';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this.boundClass = this.getAttr('bound-class');
  }
});
