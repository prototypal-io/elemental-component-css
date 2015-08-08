/* jshint node: true */
'use strict';

var stew = require('broccoli-stew');
var CachingWriter = require('broccoli-caching-writer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var symlinkOrCopySync = require('symlink-or-copy').sync;
var path = require('path');
var postcss = require('postcss');
var Promise = require('rsvp').Promise;
var postcssEmberComponents = require('postcss-ember-components');

var COMPONENT_CSS_PATTERN = /^[^\/]+\/styles\/components\/.+\.css/;

var PostCSSWriter = CachingWriter.extend({
  init: function() {
    this._super.apply(this, arguments);
    this.enforceSingleInputTree = true;
    this.filterFromCache = {
      exclude: [COMPONENT_CSS_PATTERN]
    }
  },

  updateCache: function(inDir, outDir) {
    var walkSync = require('walk-sync');
    var promises = [];
    var postcss = require('postcss');
    walkSync(inDir).forEach(function (filename) {
      var inFile = path.join(inDir, filename);
      var stats = fs.statSync(inFile);
      if (stats.isDirectory()) {
        return;
      }
      var outFile = path.join(outDir, filename);
      console.log(outFile);
      mkdirp.sync(path.dirname(outFile));
      if (COMPONENT_CSS_PATTERN.test(filename)) {
        var css = fs.readFileSync(inFile, 'utf8');
        promises.push(postcss([
          postcssEmberComponents
        ]).process(css, {from: filename, to: filename}).then(function (result) {
          var lookupObject;
          result.messages.forEach(function (message) {
            if (message.type === 'lookup-object') {
              lookupObject = message.data;
            }
          });
          var css = "import ComponentStyle from 'elemental-component-css/component-style';\n";
          css += "export default new ComponentStyle("+
            JSON.stringify(result.css) + ", " +
            JSON.stringify(lookupObject)+");";
          outFile = outFile.replace('.css', '.js');
          fs.writeFileSync(outFile, css);
        }));
      } else {
        symlinkOrCopySync(inFile, outFile);
      }
    });
    return Promise.all(promises).then(function () {
      return outDir;
    });
  }
});

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
      console.log(this.parent.pkg.name);
      console.log(this.parent.name());
      registry.add('js', {
        name: 'elemental-component-css',
        ext: 'css',
        toTree: function(tree) {
          tree = new PostCSSWriter(tree);
          return stew.log(tree);
        }
      });
    }
  }
};
