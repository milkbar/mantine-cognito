import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import external from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';

import pkg from './package.json' assert { type: 'json' };

export default [
  {
    external: [
      '@aws-crypto/sha256-js',
      '@aws-sdk/credential-providers',
      '@aws-sdk/protocol-http',
      '@aws-sdk/signature-v4',
      '@aws-sdk/util-format-url',
      'amazon-cognito-identity-js',
      'qrcode.react',
      'ua-parser-js',
      '@mantine/core',
      '@mantine/form',
      '@mantine/hooks',
      '@tabler/icons-react',
      'react',
    ],
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react'],
      }),
      external(),
      resolve(),
      typescript({
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
      copy({
        targets: [
          { src: '../../README.md', dest: '.' },
          { src: '../../LICENSE', dest: '.' },
          { src: '../../CONTRIBUTING.md', dest: '.' },
        ],
      }),
    ],
  },
  {
    input: './dist/esm/types/index.d.ts',
    output: [{ file: pkg.types, format: 'esm' }],
    plugins: [dts()],
  },
];
