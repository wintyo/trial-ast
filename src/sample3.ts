import { parse, types, traverse } from '@babel/core';

const src = '1 + 2';
const ast = parse(src);

traverse(ast, {
  BinaryExpression: (nodePath) => {
    const { left, right, operator } = nodePath.node;
    if (types.isNumericLiteral(left) && types.isNumericLiteral(right)) {
      const evalText = `${left.value} ${operator} ${right.value}`;
      const result = eval(evalText);
      console.log(evalText, '=', result);
    }
  },
});
