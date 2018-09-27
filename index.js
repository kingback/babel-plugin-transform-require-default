var requireDefaultFunc = '__require_default_func__';
var requireDefaultFuncTemp = `function ${requireDefaultFunc}(module) { return module && module.__esModule && typeof module["default"] !== 'undefined' ? module["default"] : module; }`;

function typeOf(v) {
  return Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
}

function isExcluded(exclude, module) {
  if (exclude) {
    switch (typeOf(exclude)) {
      case 'string':
        return exclude === module;
      case 'regexp':
        return exclude.test(module);
      case 'function':
        return exclude(module);
      case 'array':
        var excluded = false;
        exclude.some(function(e) {
          return (excluded = isExcluded(e, module));
        });
        return excluded;
      default:
        return false;
    }
  } else {
    return false;
  }
}

module.exports = function (babel, options) {
  options = options || {};
  var { types, template } = babel;
  var requirePaths;

  function isRequireCallExpression(path) {
    const node = path.node;
    const parentNode = path.parent; 
    return types.isIdentifier(node.callee, { name: 'require' }) && // ignore a.require('xxx')
      types.isStringLiteral(node.arguments[0]) && // ignore require(), require(aaa), require(111)
      node.arguments.length === 1 && // ignore require('xxx', a)
      node.arguments[0].value && // ignore require('')
      !(types.isMemberExpression(parentNode) && (parentNode.property.name || parentNode.property.value) === 'default'); // ignore require('xxx').default and require('xxx')['default']
  }
  
  return {
    visitor: {
      Program: {
        enter() {
          requirePaths = [];
        },
        exit(path) {
          if (!requirePaths.length) return;
          path.node.body.unshift(template(requireDefaultFuncTemp)());
          requirePaths.forEach(function(p) {
            p.replaceWithSourceString(`${requireDefaultFunc}(require("${p.node.arguments[0].value}"))`);
          });
        }
      },
      CallExpression(path) {
      	if (
          isRequireCallExpression(path) && 
          requirePaths.indexOf(path) < 0 && 
          !isExcluded(options.exclude, path.node.arguments[0].value)
        ) {
          requirePaths.push(path);
        }
      }
    }
  };
}