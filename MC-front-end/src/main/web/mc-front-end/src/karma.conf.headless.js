/** Configuration for the Karma Javascript test runner
 * when running as part of a Continuous Integration build.
 */
var baseConfig = require('./karma.conf.js');

module.exports = function (config) {
    // Load base config
    baseConfig(config);

    // Override base config
    config.set({
        singleRun: true,
        autoWatch: false,
        browsers: ['ChromeHeadlessNoSandbox']
    });
};