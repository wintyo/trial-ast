import { types, transform, template } from '@babel/core';
import type { PluginObj, Visitor } from '@babel/core';

const toLiterals = {
  string: (value: string) => types.stringLiteral(value),
  number: (value: number) => types.numericLiteral(value),
  boolean: (value: boolean) => types.booleanLiteral(value),
  null: (value: null) => types.nullLiteral(),
};

const valueToLiteral = (value: string | number | boolean | null) => {
  switch (typeof value) {
    case 'string':
      return toLiterals.string(value);
    case 'number':
      return toLiterals.number(value);
    case 'boolean':
      return toLiterals.boolean(value);
    default:
      return toLiterals.null(value);
  }
};

const evaluateVisitor: Visitor = {
  exit: (nodePath) => {
    if (types.isImmutable(nodePath.node)) {
      return;
    }

    const { confident, value } = nodePath.evaluate();
    if (confident && typeof value !== 'object') {
      nodePath.replaceWith(valueToLiteral(value));
    }
  },
};

const optimizePlugin: PluginObj = {
  visitor: {
    Program: (nodePath) => {
      nodePath.traverse(evaluateVisitor);
    },
  },
};

const source = `
const a = 1 + 2 * 3 / 4;
console.log(a);
let b = a + 2;
console.log(b);
`;

const result = transform(source, { plugins: [optimizePlugin] });
if (result) {
  console.log(result.code);
}
