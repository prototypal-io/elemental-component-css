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
    for (var i=0; i<attributes.length; i++) {
      var attrNode = attributes[i];
      if (attrNode.name === 'class') {
        this.transformClassAttr(attrNode);
      }
    }
  },
  transformClassAttr: function (classAttrNode) {
    //require('util').inspect(classAttrNode, {depth: 10});
    var value = classAttrNode.value;
    if (value.type === 'TextNode') {
      var classes = value.chars.trim().split(/\s+/);
      if (classes.length === 1) {
        var className = classes[0];
        classAttrNode.value = {
          type: 'MustacheStatement',
          path: {
            loc: null,
            type: 'PathExpression',
            original: 'classes.' + className,
            parts: [ 'classes', className ]
          },
          params: [],
          hash: { type: 'Hash', pairs: [] },
          escaped: true,
          loc: null
        };
      }
    }
    //console.log('classAttrNode');
    //console.dir(classAttrNode.value)
  }
}

module.exports = TransformComponentClasses;
