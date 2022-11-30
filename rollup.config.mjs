import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from 'rollup-plugin-json';
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
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    shebang(),
    json(),
    peerDepsExternal(),
    cleaner({
      targets: ['./dist'],
    }),
    resolve(),
    commonjs(),
    replace({
      'process.env.AUTH0_CLIENT_ID': `"${process.env.AUTH0_CLIENT_ID}"`,
      'process.env.AUTH0_DOMAIN': `"${process.env.AUTH0_DOMAIN}"`,
      'process.env.AUTH0_TOKEN_AUDIENCE': `"${process.env.AUTH0_TOKEN_AUDIENCE}"`,
      'process.env.SALABLE_API_ENDPOINT': `"${process.env.SALABLE_API_ENDPOINT}"`,
    }),
    typescript({
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
        },
      },
    }),
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
    copy({
      targets: [{ src: 'src/auth/**.html', dest: 'dist/auth' }],
    }),
  ],
};

export default config;
