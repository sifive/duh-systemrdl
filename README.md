[![NPM version](https://img.shields.io/npm/v/duh-systemrdl.svg)](https://www.npmjs.org/package/duh-systemrdl)
[![Actions Status](https://github.com/sifive/duh-systemrdl/workflows/Tests/badge.svg)](https://github.com/sifive/duh-systemrdl/actions)

Import SystemRDL into DUH

## CLI Options

```
>duh-systemrdl --help
Usage: duh-systemrdl [options]

Options:
  -p, --perl     dump intermediate Perl file
  -o, --post     dump post Perl processed RDL file
  -l, --lsp      dump RDL AST in Lisp format
  -v, --verbose  print file names and Parser error counts
  -V, --version  output the version number
  -h, --help     display help for command
```

## SystemRDL -> DUH.JS

### Zero install option

```
npx duh-systemrdl <path/to/*.rdl>
```

### Install option

To install tool

```
npm init -y
npm i duh-systemrdl
```

To run tool

```
./node_modules/.bin/duh-systemrdl <path/to/*.rdl>
```
