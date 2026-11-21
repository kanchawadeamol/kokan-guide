// Explicit Babel config so Metro and Jest (jest-expo) use the same transform.
module.exports = function babelConfig(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
