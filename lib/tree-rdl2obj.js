'use strict';

const traverse = require('./traverse.js');

module.exports = node => {
  const stack = [{body: [], propo: {}}];
  traverse({
    enter: (node) => {
      const top = stack[stack.length - 1];
      let o;
      switch (node.type) {
      case 'component_named_def':
        o = {
          type: node.typeNode.text,
          id: node.idNode.text,
          body: [],
          propo: {},
          insts: []
        };
        stack.push(o);
        stack[stack.length - 2].body.push(o);
        break;
      case 'component_anon_def':
        o = {
          type: node.typeNode.text,
          body: [],
          propo: {},
          insts: []
        };
        stack.push(o);
        stack[stack.length - 2].body.push(o);
        break;
      case 'explicit_prop_assignment':
        if (node.LHSNode && node.LHSNode.text) {
          top.propo[node.LHSNode.text] = (node.RHSNode || {}).text;
        }
        break;
      case 'component_inst':
        top.insts.push({
          id: node.idNode.text,
          // range: (node.rangeNode || {}).text,
          a0: (node.a0Node || {}).text,
          a1: (node.a1Node || {}).text,
          a2: (node.a2Node || {}).text,
          a3: (node.a3Node || {}).text
        });
        break;
      case 'range':
        top.insts[top.insts.length - 1].range = {
          msb: parseInt(node.msbNode.text),
          lsb: parseInt(node.lsbNode.text)
        };
        break;
      }
    },
    leave: (node) => {
      switch (node.type) {
      case 'component_def':
        stack.pop();
        break;
      }
    }
  })(node);
  return stack;
};
