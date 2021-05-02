import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // if args.path equal 'index.js' - handle root index.js file
      build.onResolve({ filter: /(^index\.js$)/ }, () => ({
        path: "index.js",
        namespace: "a",
      }));

      // if args.path have "./" or "../" on it - handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, (args: any) => ({
        namespace: "a",
        path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
          .href,
      }));

      // if args.path have ".anything" - handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
