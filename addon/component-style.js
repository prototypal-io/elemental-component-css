import Ember from 'ember';

Ember.Component.reopen({
  componentStyle: Ember.computed(function () {
    var key = this._debugContainerKey.replace('component:', 'style:');
    return this.container.lookup(key);
  })
});

export default Ember.Object.extend({
  init() {
    this.ref = 0;
    this.style = null;
  },

  append() {
    if (this.ref++ === 0) {
      let style = this.style = document.createElement('style');
      style.appendChild(document.createTextNode(this.css));
      document.head.appendChild(style);
    }
  },

  remove() {
    if (this.ref > 0 && this.ref-- === 1) {
      this.style.parentNode.removeChild(this.style);
      this.style = null;
    }
  }
});
