module.exports = {
  name: 'elemental-component-css',
  ext: 'css',
  toTree: function(tree) {
    var ComponentStyle = require('./broccoli-component-style');
    return new ComponentStyle(tree);
  }
}
