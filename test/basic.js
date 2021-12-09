'use strict';

const chai = require('chai');

const lib = require('../lib/index.js');

const expect = chai.expect;

describe('basic', () => {

  it('rdl2obj', () => {
    expect(lib.rdl2obj).to.be.a('function');
  });

  it('perlTemplate', () => {
    expect(lib.perlTemplate).to.be.a('function');
  });

});

/* eslint-env mocha */
