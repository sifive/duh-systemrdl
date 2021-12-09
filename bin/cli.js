#!/usr/bin/env node
'use strict';

const process = require('process');
const path = require('path');
const { readFile, writeFile, stat } = require('fs/promises');
const { spawn } = require('child_process');
const { program } = require('commander');
const json5 = require('json5');

const lib = require('../lib/');

const main = async () => {
  program
    .parse(process.argv);

  const opts = program.opts();

  const rdl2obj = lib.rdl2obj();
  for (const fName of program.args) {
    const fullName = path.resolve(process.cwd(), fName);

    const src = await readFile(fullName, {encoding: 'utf8'});
    const srcPre = lib.perlTemplate(src);

    await writeFile(fullName + '.pl', srcPre);

    const perl = spawn('perl');
    perl.stdin.end(srcPre);

    let srcPost = '';
    for await (const data of perl.stdout) {
      srcPost += data;
    }

    await writeFile(fullName + '.post', srcPost);

    const {obj, lst, err} = rdl2obj(srcPost);

    console.log(err, fullName);

    await writeFile(fullName + '.lsp', lst);

    await writeFile(fullName + '.js', obj);
  }
};

main();
