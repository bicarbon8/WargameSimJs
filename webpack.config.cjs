const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;
const deps = require('./package.json').dependencies;

module.exports = {
  output: {
    uniqueName: "wargameSimJs",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
        library: { type: "module" },

        // For remotes (please adjust)
        name: "WargameSimJs",
        filename: "remoteEntry.js",
        exposes: {
            './Module': './src/app/game/game.module.ts',
        },      

        shared: {
          "@angular/core": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/core"] }, 
          "@angular/common": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/common"] }, 
          "@angular/common/http": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/common/http"] }, 
          "@angular/router": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/router"] }
        }
    })
  ],
};
