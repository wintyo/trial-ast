import { types, parse, transform, template } from '@babel/core';
import type { PluginItem, PluginObj } from '@babel/core';

const src = 'function hoge() { return 1; }';

const TARGET_ID = 'hoge';
const REPLACE_CODE = 'function hoge() { return 2; }';

const WAS_CREATED = Symbol('WasCreated');

const plugin: PluginObj = {
  visitor: {
    FunctionDeclaration: (nodePath, state) => {
      // @ts-ignore
      console.log('wasCreated:', nodePath[WAS_CREATED]);
      // @ts-ignore
      if (nodePath[WAS_CREATED] || !types.isIdentifier(nodePath.node.id)) {
        return;
      }
      if (nodePath.node.id.name === TARGET_ID) {
        const newAst = template(REPLACE_CODE)();
        if (!Array.isArray(newAst)) {
          nodePath.replaceWith(newAst);
        }
        // @ts-ignore
        nodePath[WAS_CREATED] = true;
      }
    },
  },
};

const result = transform(src, { plugins: [plugin] });
if (result) {
  console.log(result.code);
}
