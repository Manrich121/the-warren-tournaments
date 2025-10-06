const { FlatCompat } = require('@eslint/eslintrc');
const ts = require('typescript-eslint');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname
});

module.exports = [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'scripts/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      // Add or override any specific rules here
    }
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'dist/',
      '.swc/',
      'specs/',
      '.specify/',
      'prisma/',
      '.idea/',
      '.vercel/',
      'jest.config.js',
      'jest.setup.js',
      'next-env.d.ts',
      'next.config.js',
      'postcss.config.js',
      'prettier.config.js',
      'eslint.config.js',
      'tailwind.config.ts'
    ]
  }
];
