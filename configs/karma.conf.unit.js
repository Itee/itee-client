/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module config/karmaUnitConfiguration
 *
 * @description The file manage the karma configuration for run unit tests that are under `tests/units` folder
 *
 */

/* eslint-env node */

/**
 * Will assign an appropriate configuration object for karma.
 *
 * @param {object} config - The karma configuration object to extend
 */
function CreateKarmaUnitTestingConfiguration( config ) {

    config.set( {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'mocha', 'chai' ],

        // list of files / patterns to load in the browser
        files: [
            //            'builds/my_app_name.iife.js',
            'tests/units/**/*.unit.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'mocha' ],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'Chrome' ],
        //        browsers: ['Chrome', 'Firefox', 'Safari', 'IE'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity

        // Pass configuration options directly to mocha
        // Todo[TV - 14/10/2017]: Waiting fix to integrate mocha html reporter that will be mergable into jsdoc, check for benchmarks reporter too
        //        client: {
        //
        //            mocha: {
        //                //                opts: 'test/mocha.opts' // You can set opts to equal true then plugin will load opts from default location 'test/mocha.opts'
        //                reporter:        'mochawesome',
        //                reporterOptions: {
        //                    reportDir:       'tests/units/reports/',
        //                    reportFilename:  'my_app_name.report',
        //                    reportTitle:     'MyApp Report',
        //                    reportPageTitle: 'MyApp Report',
        //                    inlineAssets:    false,
        //                    enableCharts:    true,
        //                    enableCode:      true,
        //                    autoOpen:        true,
        //                    overwrite:       true,
        //                    timestamp:       true,
        //                    showHooks:       "showHooks",
        //                    quiet:           false
        //                }
        //            }
        //        }

    } )

}

module.exports = CreateKarmaUnitTestingConfiguration
