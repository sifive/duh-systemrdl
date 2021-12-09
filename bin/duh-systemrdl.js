#!/usr/bin/env node
'use strict';

const pkg = require('../package.json');
const process = require('process');
const path = require('path');
const { readFile, writeFile, stat } = require('fs/promises');
const { spawn } = require('child_process');
const { program } = require('commander');
const json5 = require('json5');

const lib = require('../lib');

const main = async () => {
  program
    .option('-p, --perl',    'dump intermediate Perl file')
    .option('-o, --post',    'dump post Perl processed RDL file')
    .option('-l, --lsp',     'dump RDL AST in Lisp format')
    .option('-v, --verbose', 'print file names and Parser error counts')
    .version(pkg.version)
    .parse(process.argv);

  const opts = program.opts();

  const rdl2obj = lib.rdl2obj();
  for (const fName of program.args) {
    const fullName = path.resolve(process.cwd(), fName);

    const src = await readFile(fullName, {encoding: 'utf8'});
    const srcPre = lib.perlTemplate(src);

    if (opts.perl) {
      await writeFile(fullName + '.pl', srcPre);
    }

    const perl = spawn('perl');
    perl.stdin.end(srcPre);

    let srcPost = '';
    for await (const data of perl.stdout) {
      srcPost += data;
    }

    if (opts.post) {
      await writeFile(fullName + '.post', srcPost);
    }

    const {obj, lst, err} = rdl2obj(srcPost);

    if (opts.verbose) {
      console.log(err, fullName);
    }

    if (opts.lsp) {
      await writeFile(fullName + '.lsp', lst);
    }

    await writeFile(fullName + '.js', obj);
  }
};

main();
