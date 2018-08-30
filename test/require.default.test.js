const babel = require('babel-core');
const plugin = require('../index');

var example = `
a.require("xxx");
arequire("xxx");
require(ddd);
require('');
require();
require('xxx');
require('xxx')();
require(111);
require('xxx').default;
require('xxx')['default'];
`;

it('require default', () => {
  const {code} = babel.transform(example, {plugins: [plugin]});
  expect(code).toMatchSnapshot();
});