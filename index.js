/* jshint node: true */
'use strict';

function monkeyPatch(EmberApp) {
  EmberApp.prototype._filterAppTree = function() {
    return this.trees.app;
  };
}

module.exports = {
  name: 'elemental-component-css',
  included: function(app) {
    monkeyPatch(app.constructor);
  },
  setupPreprocessorRegistry: function (type, registry) {
    if (type === 'parent') {
      registry.add('js', require('./lib/component-style-preprocessor'));
      registry.add('htmlbars-ast-plugin', {
        name: 'transform-component-classes',
        plugin: require('./lib/transform-component-classes')
      });
    }
  }
};
