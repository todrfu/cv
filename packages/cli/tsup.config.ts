import { defineConfig } from 'tsup';

export default defineConfig({
  // sourcemap: true,
  entry: ['src/**/*.ts'],
  format: ['cjs'],
  target: 'es5',
  clean: true,
  // dts: true,
  platform: 'node',
  legacyOutput: true,
  esbuildOptions(options, context) {
     // the directory structure will be the same as the source
    //  options.outbase = "./";
  },
});
