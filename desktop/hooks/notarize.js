const { notarize } = require('electron-notarize');
const fs = require('fs');
const path = require('path');

// Path from here to your build app executable:
const buildOutput = path.resolve(
    __dirname,
    '..',
    'out',
    'Water Cooler-darwin-x64',
    'Water Cooler.app'
);

module.exports = function () {
    if (process.platform !== 'darwin') {
        console.log('Not a Mac; skipping notarization');
        return;
    }

    console.log('Notarizing...');

    return notarize({
        appBundleId: "com.watercooler.app",
        appPath: buildOutput,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        ascProvider: process.env.APPLE_PROVIDER
    }).catch((e) => {
        throw e;
    });
}