var COMPONENT_MODULE_PATTERN = /.+\/components\/.+/;

function TransformComponentClasses(options) {
  this.syntax = null;
  this.options = options;
}

TransformComponentClasses.prototype = {
  transform: function (ast) {
    var moduleName = this.options && this.options.moduleName;
    if (this.isComponentTemplate(moduleName)) {
      //console.log('transform: '+moduleName);
      return this.transformComponentTemplate(ast);
    }
    return ast;
  },
  isComponentTemplate: function (moduleName) {
    return COMPONENT_MODULE_PATTERN.test(moduleName);
  },
  transformComponentTemplate: function (ast) {
    var walker = new this.syntax.Walker();
    var _this = this;
    walker.visit(ast, function(node) {
      if (node.type === 'ElementNode') {
        _this.transformElementNode(node);
      }
    });
    return ast;
  },
  transformElementNode: function (elementNode) {
    var attributes = elementNode.attributes;

    //console.log(require('util').inspect(attributes, {depth: 10}));
    for (var i=0; i<attributes.length; i++) {
      var attrNode = attributes[i];
      if (attrNode.name === 'class') {
        this.transformClassAttr(attrNode);
      }
    }
  },
  transformClassAttr: function (classAttrNode) {
    var value = classAttrNode.value;
    if (value.type === 'TextNode') {
      classAttrNode.value = {
        type: 'ConcatStatement',
        parts: concatParts(value.chars)
      }
    } else if (value.type === 'ConcatStatement') {
      //console.log('ConcatStatement');
      var parts = value.parts;
      var newParts;
      var args;
      for (var i=parts.length-1; i>=0; i--) {
        var part = parts[i];
        if (part.type === 'StringLiteral') {
          newParts = concatParts(part.value);
          // delete StringLiteral replace with new parts
          args = [i, 1].concat(newParts);
          parts.splice.apply(parts, args);
        }
      }
    }
  }
}

var WSP = /\s+/;

function concatParts(classString) {
  var parts = [];
  var notWSPOrWSP = /(\S+|\s+)/g; // tracks state
  var match;
  while (match = notWSPOrWSP.exec(classString)) {
    var value = match[0];
    if (WSP.test(value)) {
      parts.push({
        loc: null,
        type: 'StringLiteral',
        value: value,
        original: value
      });
    } else {
      parts.push({
        loc: null,
        type: 'PathExpression',
        original: 'classes.' + value,
        parts: [ 'classes', value ]
      });
    }
  }
  return parts;
}

module.exports = TransformComponentClasses;
