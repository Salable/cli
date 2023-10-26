import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import shebang from 'rollup-plugin-preserve-shebang';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import dotenv from 'dotenv';
import packageJson from './package.json' assert { type: 'json' };

dotenv.config();

const config = {
  input: './src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    shebang(),
    json(),
    peerDepsExternal(),
    cleaner({
      targets: ['./dist'],
    }),
    resolve({ exportConditions: ['node'] }),
    commonjs(),
    replace({
      'process.env.LAUNCHDARKLY_SDK_CLIENT_SIDE_ID': `"${process.env.LAUNCHDARKLY_SDK_CLIENT_SIDE_ID}"`,
    }),
    typescript({
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
        },
        exclude: ['**/templates/**', '**/docs/**'],
        include: ['src', 'additional.d.ts'],
      },
    }),
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
    copy({
      targets: [
        { src: 'src/auth/**.html', dest: 'dist/auth' },
        { src: 'src/templates', dest: 'dist' },
      ],
    }),
  ],
};

export default config;
