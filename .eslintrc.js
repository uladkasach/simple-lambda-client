module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'max-len': ["warn", 140, { ignoreTrailingComments: true, ignoreComments: true }],
    'object-curly-newline': "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_$" }],
  },
  'plugins': [
    'graphql',
  ],
  "env" : {
    "jest": true
  }
};
