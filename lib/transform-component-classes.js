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

    for (var i=0; i<attributes.length; i++) {
      var attrNode = attributes[i];
      if (attrNode.name === 'class') {
        this.transformClassAttr(attrNode);
      }
    }
  },
  transformClassAttr: function (classAttrNode) {
    var value = classAttrNode.value;
    var params;
    switch (value.type) {
      case 'TextNode': // class="foo bar"
        console.log('TextNode')
        console.dir(value);
        params = paramsFromTextNode(value);
        break;
      case 'ConcatStatement': // class="foo {{bar}}"
        console.log('ConcatStatement')
        params = paramsFromConcatStatement(value);
        break;
      case 'MustacheStatement': // class={{foo}}
        console.log('MustacheStatement')
        params = paramsFromMustacheStatement(value);
        break;
      default:
        throw new Error('unrecognized node type "' + value.type + '" for class attribute value');
    }
    classAttrNode.value = {
      type: 'MustacheStatement',
      path: {
        type: 'PathExpression',
        original: 'el-component-class',
        parts: [ 'el-component-class' ]
      },
      params: params,
      hash: { type: 'Hash', pairs: [] },
      escaped: true
    }
  }
}

function makeMustacheAnExpression(mustacheStatement) {
  if (mustacheStatement.params.length ||
      mustacheStatement.hash.pairs.length ||
      mustacheStatement.path.original.indexOf('-') !== -1) {
    mustacheStatement.type = 'SubExpression';
    return mustacheStatement;
  }
  return mustacheStatement.path;
}

function paramsFromTextNode(textNode) {
  return [{
    type: 'PathExpression',
    original: 'this',
    parts: [ 'this' ]
  }, {
    type: "StringLiteral",
    value: textNode.chars,
    original: textNode.chars
  }];
}

function paramsFromConcatStatement(concatStatement) {
  var params = concatStatement.parts;
  return [{
    type: 'PathExpression',
    original: 'this',
    parts: [ 'this' ]
  }].concat(concatStatement.parts.map(function (node) {
    if (node.type === 'MustacheStatement') {
      return makeMustacheAnExpression(node);
    }
    return node;
  }));
}

function paramsFromMustacheStatement(mustacheStatement) {
  mustacheStatement.type = 'SubExpression';
  return [{
    type: 'PathExpression',
    original: 'this',
    parts: [ 'this' ]
  }, makeMustacheAnExpression(mustacheStatement)];
}

module.exports = TransformComponentClasses;
