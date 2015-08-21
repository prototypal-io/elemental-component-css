var COMPONENT_MODULE_PATTERN = /.+\/components\/.+/;

function TransformComponentClasses(options) {
  this.syntax = null;
  this.options = options;
}

TransformComponentClasses.prototype = {
  transform: function (ast) {
    var moduleName = this.options && this.options.moduleName;
    if (this.isComponentTemplate(moduleName)) {
      console.log('transform: '+moduleName);
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
      var classNames = value.chars.trim().split(/\s+/);
      classAttrNode.value = concatClassNames(classNames);
    }
  }
}

function concatClassNames(classNames) {
  var parts = [];
  for (var i=0; i<classNames.length; i++) {
    if (i !== 0) {
      parts.push({ type: 'StringLiteral', value: ' ', original: ' ' });
    }
    parts.push(classNamePathExpression(classNames[i]));
  }
  return {
    type: 'ConcatStatement',
    parts: parts
  }
}

function classNamePathExpression(className) {
  return {
    loc: null,
    type: 'PathExpression',
    original: 'classes.' + className,
    parts: [ 'classes', className ]
  };
}

module.exports = TransformComponentClasses;
