import os from 'os';

export const isProd = process.env.NODE_ENV === 'production';

export const rootDir = os.homedir();
