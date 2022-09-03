import { types, parse, transform } from '@babel/core';
import type { PluginObj } from '@babel/core';

const src = 'const hoge = require("hoge")';

const TARGET_ID = 'hoge';
const REPLACE_CODE = 'require("dummy-hoge")';

const plugin: PluginObj = {
  visitor: {
    VariableDeclarator: (nodePath, state) => {
      if (
        types.isIdentifier(nodePath.node.id) &&
        nodePath.node.id.name === TARGET_ID
      ) {
        const newAst = parse(REPLACE_CODE);
        if (newAst) {
          // parseExpressionがなかったので全体をparseしてbody部分だけ差し替える
          nodePath.get('init').replaceWith(newAst.program.body[0]);
        }
      }
    },
  },
};

const result = transform(src, { plugins: [plugin] });
if (result) {
  console.log(result.code);
}
