import { transform, types } from '@babel/core';
import type { PluginObj } from '@babel/core';

const src = '1 + 2';

const plugin: PluginObj = {
  visitor: {
    BinaryExpression: (nodePath) => {
      if (nodePath.node.operator !== '*') {
        const newAst = types.binaryExpression(
          '*',
          nodePath.node.left,
          nodePath.node.right
        );
        nodePath.replaceWith(newAst);
      }
    },
  },
};

const result = transform(src, { plugins: [plugin] });
if (result) {
  console.log(result.code);
}
