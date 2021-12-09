'use strict';

const Parser = require('tree-sitter');
const treeSitterSystemrdl = require('tree-sitter-systemrdl');

const extract = require('./tree-rdl2js.js');

function inspect (root) {
  let errors = 0;
  let missing = 0;
  const rec = node => {
    if (node.type === 'ERROR') {
      errors += 1;
    } else
    if (node.isMissing()) {
      missing += 1;
    }
    const childCount = node.childCount;
    for (let i = 0; i < childCount; i++) {
      rec(node.child(i));
    }
  };
  rec(root);
  return {errors, missing};
}

module.exports = () => {
  const parser = new Parser();
  parser.setLanguage(treeSitterSystemrdl);
  return source => {
    const tree = parser.parse(source);
    const obj = extract(tree.rootNode);
    const lst = tree.rootNode.toString();
    const err = inspect(tree.rootNode);
    return {obj, lst, err};
  };
};
