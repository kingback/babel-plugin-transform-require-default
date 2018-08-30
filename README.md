# babel-plugin-transform-require-default


## Why

Babel@6/7 doesn't export default module.exports any more - [T2212 Kill CommonJS default export behavior](https://github.com/babel/babel/issues/2212)

It means in a ES6 module, you have to use `require` like:

```
const A = require('a').default;
```

## How it works

transform:

```
const A = require('a');
```

into

```js
function __require_default_func__(module) { return module && module.__esModule ? module["default"] : module; }
const A = __require_default_func__(require('a'));
```

## Options

### `exclude`

`string/regexp/function/array`, exclude module

```js
{
  plugins: [
    ['transform-require-default', {
      exclude: "lodash",
      exclude: /lodash/,
      exclude: [
        /lodash/,
        "react"
      ],
      exclude(module) {
        return module === 'lodash';
      }
    }]
  ]
}
```
