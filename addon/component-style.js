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

  prefixSelector(selector) {
    if (!selector) { throw new Error('missing selector arg'); }

    let prefixed = this.selectorMap[selector];
    if (!prefixed) {
      prefixed = prefixSelector(this.prefix, selector);
      this.selectorMap[selector] = prefixed;
    }
    return prefixed;
  },

  //TODO make class only
  prefixClass(className) {
    let selector = '.' + className;
    let prefixed = this.prefixSelector(selector);
    return prefixed.slice(1);
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

function prefixSelector(prefix, selector) {
  if (selector === ':--component') {
    return '.' + prefix;
  }

  if (selector[0] === '.') {
    return '.' + this.prefix + '-' + selector.slice(1);
  }

  throw new Error('unsupported selector "' + selector + '"');
}
