'use strict';

const traverse = require('./traverse.js');
const json5 = require('json5');

const fields2obj = node => node.fields.reduce((res, e) => {
  res[e] = (node[e] || {}).text;
  return res;
}, {});

function getNumber (arg) {
  const n0 = Number(arg);
  if (!isNaN(n0)) {
    return n0;
  }
  if (typeof arg !== 'string') {
    console.error(arg);
    return;
  }
  const m2 = arg.match(/([0-9]+)'([b])([01])+/);
  if (m2) {
    return parseInt(m2[3], 2);
  }
  const m16 = arg.match(/([0-9]+)'([hH])([0-9a-fA-F])+/);
  if (m16) {
    return parseInt(m16[3], 16);
  }
  console.error(arg);
}

function getBitOffset (arg) {
  if (typeof arg !== 'string') {
    console.error(arg);
    return;
  }
  const m = arg.match(/\[([0-9]+):([0-9]+)\]/);
  if (m) {
    return Number(m[2]);
  }
  console.error(arg);
}

function getBitWidth (arg) {
  if (typeof arg !== 'string') {
    console.error(arg);
    return;
  }
  const m = arg.match(/\[([0-9]+):([0-9]+)\]/);
  if (m) {
    return Number(m[1]) - Number(m[2]) + 1;
  }
  console.error(arg);
}

const assignLut = {
  sw: {
    lhs: 'access',
    rhs: {
      r: '\'read-only\'',
      w: '\'write-only\'',
      rw: '\'read-write\''
    }
  },
  hw: {
    lhs: 'hwAccess',
    rhs: {
      r: '\'read-only\'',
      w: '\'write-only\'',
      rw: '\'read-write\''
    }
  },
  AccessType: {
    lhs: 'access',
    rhs: {
      '"R"':  '\'read-only\'',
      '"W"':  '\'write-only\'',
      '"RW"': '\'read-write\'',
      '"RO/V"': '\'read-only\'',
      '"RW/V"': '\'read-write\''
    }
  },
  desc: {lhs: 'description'},
  regwidth: {lhs: 'size'}
};

const assign = node => {
  if (!node.LHSNode) {
    return '';
  }
  const o = assignLut[node.LHSNode.text] || {
    lhs: node.LHSNode.text
  };
  let rhs = o.rhs
    ? o.rhs[node.RHSNode.text]
    : node.RHSNode.text;

  return rhs
    ? 'res.' + o.lhs + ' = ' + rhs.replace(/`/g, '\\`').replace(/"/g, '`').replace(/\n/g, '<br>') + ';'
    : '';
};

const catLut = type => ({
  addrmap: 'addressBlocks',
  regfile: 'registerFiles',
  reg: 'registers',
  field: 'fields'
})[type] || type;

module.exports = node => {
  // const stack = [{body: [], propo: {}}];
  const res = [
    '\'use strict\';',
    getNumber.toString(),
    getBitOffset.toString(),
    getBitWidth.toString(),
    'const res = {};'
  ];
  let type;
  let indent = '';
  function push () {
    for (let i = 0; i < arguments.length; i++) {
      res.push(indent + arguments[i]);
    }
  }

  traverse({
    enter: (node) => {
      switch (node.type) {
      case 'component_named_def':
        type = catLut(node.typeNode.text);
        push(
          'res.' + node.idNode.text + ' = res => insts => { // ' + node.typeNode.text,
          '  res.' + type + ' = res.' + type + ' || [];',
          '  res.' + type + '.push(...insts.map(inst => {',
          '    const res = {};',
          '    res.name = \'' + node.idNode.text + '\';',
          '    res.resetValue = 0;'
        );
        indent += '    ';
        break;
      case 'component_anon_def':
        type = catLut(node.typeNode.text);
        push(
          'res.' + type + ' = res.' + type + ' || [];',
          'res.' + type + '.push(...(insts => insts.map(inst => {',
          '  const res = {};',
          '  res.resetValue = getNumber(inst.a0Node);',
          '  res.bitOffset = getBitOffset(inst.aorNode);',
          '  res.bitWidth = getBitWidth(inst.aorNode);',
        );
        indent += '  ';
        break;
      case 'explicit_component_inst':
        push('(res.' + node.idNode.text + '(res)');
        break;
      case 'explicit_prop_assignment':
        push(assign(node));
        break;
      case 'component_insts':
        push('([');
        break;
      case 'component_inst':
        push('  ' + json5.stringify(fields2obj(node)) + ',');
        break;
      }
    },
    leave: (node) => {
      switch (node.type) {
      case 'component_named_def':
        indent = indent.slice(0, -4);
        push(
          '    res.name = inst.idNode || res.name;',
          '    res.addressOffset = inst.a1Node ? Number(inst.a1Node) : 88888;',
          '    return res;',
          '  }));',
          '  return res;',
          '};'
        );
        break;
      case 'component_anon_def':
        indent = indent.slice(0, -2);
        push(
          '  res.name = inst.idNode || res.name;',
          '  return res;',
          '}))'
        );
        break;
      case 'component_insts':
        push(']));');
        break;
      }
    }
  })(node);
  res.push(
    'module.exports = res;'
  );
  return res.join('\n');
};
