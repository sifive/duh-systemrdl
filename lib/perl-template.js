'use strict';

const out = (res, str) => {
  if (str !== '') {
    str = str.replace(/@/g, '\\@');
    res.push('print <<EOD;\n' + str);
  }
};

module.exports = (src) => {
  let res = [];
  let rest = src;
  let state;

  const stt = {
    idle: () => {
      const index = rest.search('<%');
      if (index === -1) {
        out(res, rest);
        rest = '';
        res.push('EOD\n');
      } else {
        out(res, rest.slice(0, index));
        rest = rest.slice(index);
        if (rest.slice(0, 2) === '<%') {
          rest = rest.slice(2);
          state = stt.prep;
        } else {
          console.err(rest); /* eslint no-console: 0 */
        }
      }
    },
    prep: () => {
      const index = rest.search('%>');
      if (index === -1) {
        rest = '';
      } else {
        const first = rest.slice(0, index);
        res.push('EOD\n' + first);
        rest = rest.slice(index + 2);
        state = stt.idle;
      }
    }
  };

  state = stt.idle;

  do {
    state();
  } while (rest !== '');

  return res.join('\n');
};
