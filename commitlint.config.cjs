module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case']],
    'body-max-line-length': [2, 'always', 120],
    'footer-max-line-length': [2, 'always', 120]
  }
};

