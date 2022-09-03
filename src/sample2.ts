import { types } from '@babel/core';
import generate from '@babel/generator';

const ast = types.binaryExpression(
  '*',
  types.numericLiteral(1),
  types.numericLiteral(2)
);
const result = generate(ast);
console.log(result.code);
