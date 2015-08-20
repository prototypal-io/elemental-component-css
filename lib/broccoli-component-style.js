var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var symlinkOrCopySync = require('symlink-or-copy').sync;
var walkSync = require('walk-sync');
var CachingWriter = require('broccoli-caching-writer');
var postcss = require('postcss');
var postcssEmberComponents = require('postcss-ember-components');
var Promise = require('rsvp').Promise;

var COMPONENT_CSS_PATTERN = /^[^\/]+\/styles\/components\/.+\.css/;

module.exports = CachingWriter.extend({
  init: function () {
    this._super.apply(this, arguments);
    this.enforceSingleInputTree = true;
    this.filterFromCache = {
      exclude: [COMPONENT_CSS_PATTERN]
    }
  },
  updateCache: function (inputDir, outputDir) {
    var promises = [];
    walkSync(inputDir).forEach(function (relativeFileName) {
      var inputFileName = path.join(inputDir, relativeFileName);
      if (isDirectory(inputFileName)) {
        return;
      }
      var outputFileName = path.join(outputDir, relativeFileName);
      mkdirp.sync(path.dirname(outputFileName));
      if (this.isComponentStyleFile(relativeFileName)) {
        outputFileName = outputFileName.replace('.css', '.js');
        promises.push(
          this.processComponentStyleFile(relativeFileName, inputFileName, outputFileName)
        );
      } else {
        symlinkOrCopySync(inputFileName, outputFileName);
      }
    }, this);
    return Promise.all(promises).then(function () {
      return outputDir;
    });
  },
  isComponentStyleFile: function (inputFileName) {
    return COMPONENT_CSS_PATTERN.test(inputFileName);
  },
  processComponentStyleFile: function (relativeFileName, inputFileName, outputFileName) {
    var cssText = fs.readFileSync(inputFileName, 'utf8');
    return this.processComponentStyleCSS(
      cssText, relativeFileName
    ).then(function (cssModule) {
      fs.writeFileSync(outputFileName, cssModule);
    });
  },
  processComponentStyleCSS: function (cssText, cssFileName) {
    return postcss([
      postcssEmberComponents
    ]).process(cssText, {
      from: cssFileName,
      to: cssFileName
    }).then(function (result) {
      var metadata = findMetadata(result.messages);
      return buildComponentStyleModule(
        result.css, metadata.name, metadata.prefix, metadata.selectorMap
      );
    });
  }
});

function isDirectory(fileName) {
  var stats = fs.statSync(fileName);
  return stats.isDirectory();
}

function findMetadata(messages) {
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (message.type === 'lookup-object') {
      return message.data;
    }
  }
}

function buildComponentStyleModule(css, name, prefix, selectorMap) {
  // TODO generate hash for content-security-policy for style tag?
  return  "import ComponentStyle from 'elemental-component-css/component-style';\n" +
          "export default ComponentStyle.extend(" +
          JSON.stringify({
            css:  css,
            name: name,
            prefix: prefix,
            selectorMap: selectorMap
          }, null, 2) +
          ");\n";
}
