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
    VariableDeclarator: {
      enter: (nodePath) => {
        nodePath.scope.crawl();
        if (nodePath.get('id').isIdentifier()) {
          // @ts-ignore なぜかnameが拾えないのでignoreする
          const { name } = nodePath.node.id;
          if (name in nodePath.scope.bindings) {
            const bindings = nodePath.scope.bindings[name];
            if (bindings.references === 0) {
              nodePath.remove();
            }
          }
        }
      },
    },
  },
};

const source = `
const a = 1 + 2 * 3 / 4;
console.log(a);
let b = a + 2;
console.log(b);
for (let i = 0; i < 10; i++) {
  console.log(i + b);
}
`;

const result = transform(source, { plugins: [optimizePlugin] });
if (result) {
  console.log(result.code);
}
