const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        bin: "Danbooru Prompt Writer",
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        bin: "Danbooru Prompt Writer",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        bin: "Danbooru Prompt Writer",
        options: {
          license: "Apache-2.0"
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        bin: "Danbooru Prompt Writer",
        options: {
          license: "Apache-2.0"
        },
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "drphero",
          name: "danbooru-prompt-writer",
        },
        prerelease: true,
      },
    },
  ],
};
