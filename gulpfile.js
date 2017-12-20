/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module gulpfile
 *
 * @description The gulp tasks file. It allow to run some tasks from command line interface.<br>
 * The available tasks are:
 * <ul>
 * <li>help</li>
 * <li>clean</li>
 * <li>lint</li>
 * <li>doc</li>
 * <li>test</li>
 * <li>build</li>
 * <li>release</li>
 * </ul>
 * You could find a complet explanation about these tasks using: <b>npm run help</b>.
 *
 * @requires {@link module: [gulp]{@link https://github.com/gulpjs/gulp}}
 * @requires {@link module: [gulp-util]{@link https://github.com/gulpjs/gulp-util}}
 * @requires {@link module: [gulp-jsdoc3]{@link https://github.com/mlucool/gulp-jsdoc3}}
 * @requires {@link module: [gulp-eslint]{@link https://github.com/adametry/gulp-eslint}}
 * @requires {@link module: [gulp-inject-string]{@link https://github.com/mikehazell/gulp-inject-string}}
 * @requires {@link module: [gulp-replace]{@link https://github.com/lazd/gulp-replace}}
 * @requires {@link module: [del]{@link https://github.com/sindresorhus/del}}
 * @requires {@link module: [run-sequence]{@link https://github.com/OverZealous/run-sequence}}
 * @requires {@link module: [rollup]{@link https://github.com/rollup/rollup}}
 */

/* eslint-env node */

const gulp        = require( 'gulp' )
const util        = require( 'gulp-util' )
const jsdoc       = require( 'gulp-jsdoc3' )
const eslint      = require( 'gulp-eslint' )
const inject      = require( 'gulp-inject-string' )
const replace     = require( 'gulp-replace' )
const del         = require( 'del' )
const runSequence = require( 'run-sequence' )
const rollup      = require( 'rollup' )

const log     = util.log
const colors  = util.colors
const red     = colors.red
const green   = colors.green
const blue    = colors.blue
const cyan    = colors.cyan
const yellow  = colors.yellow
const magenta = colors.magenta

/**
 * @method npm run help ( default )
 * @description Will display the help in console
 */
gulp.task( 'default', [ 'help' ] )
gulp.task( 'help', ( done ) => {

    log( '====================================================' )
    log( '|                                                  |' )
    log( '|                Itee Client - HELP                |' )
    log( '|                                                  |' )
    log( '====================================================' )
    log( '' )
    log( 'Available commands are:' )
    log( blue( 'npm run' ), cyan( 'help' ), ' - Display this help.' )
    log( blue( 'npm run' ), cyan( 'patch' ), ' - Will patch three package to fix some invalid state.', red( '( Must be run only once after installing three package !!! )' ) )
    log( blue( 'npm run' ), cyan( 'clean' ), ' - Will delete builds and temporary folders.' )
    log( blue( 'npm run' ), cyan( 'lint' ), ' - Will run the eslint in pedantic mode with auto fix when possible.' )
    log( blue( 'npm run' ), cyan( 'doc' ), ' - Will run jsdoc, and create documentation under `documentation` folder, using the docdash theme' )
    log( blue( 'npm run' ), cyan( 'test' ), ' - Will run the test framworks (unit and bench), and create reports under `test/report` folder, using the mochawesome theme' )
    log( blue( 'npm run' ), cyan( 'unit' ), ' - Will run the karma server for unit tests.', red( '( /!\\ Deprecated: will be remove as soon as test script is fixed !!! )' ) )
    log( blue( 'npm run' ), cyan( 'bench' ), ' - Will run the karma server for benchmarks.', red( '( /!\\ Deprecated: will be remove as soon as test script is fixed !!! )' ) )
    log( blue( 'npm run' ), cyan( 'build' ), yellow( '--' ), green( '<options>' ), ' - Will build the application for development and/or production environments.', yellow( 'Note: The two dash are only required if you provide options !' ) )
    log( '  The available options are:' )
    log( '      ', green( '-d' ), 'or', green( '--dev' ), ' - to build in development environment' )
    log( '      ', green( '-p' ), 'or', green( '--prod' ), ' - to build in production environment' )
    log( '       (in case no environment is provide both will be compile)' )
    log( '' )
    log( '      ', green( '-f:' ), magenta( '<format>' ), 'or', green( '--format:' ), magenta( '<format>' ), ' - to specify the output build type.' )
    log( '       where format could be any of:', magenta( 'amd' ), magenta( 'cjs' ), magenta( 'es' ), magenta( 'iife' ), magenta( 'umd' ) )
    log( '' )
    log( '      ', green( '-s' ), 'or', green( '--sourcemap' ), ' - to build with related source map' )
    log( '' )
    log( blue( 'npm run' ), cyan( 'release' ), ' - Will run all the lint, test stuff, and if succeed will build the application in both environments.' )
    log( '' )
    log( 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( blue( 'gulp' ), cyan( 'command' ), ' - It will perform the command like using "npm run" but with less characters to type... Because you\'re a developer, right ?' )

    done()

} )

/**
 * @method npm run clean
 * @description Will delete builds and temporary folders
 */
gulp.task( 'clean', () => {

    return del( [
        './builds'
    ] )

} )

/**
 * @method npm run lint
 * @description Will lint the sources files and try to fix the style when possible
 */
gulp.task( 'lint', () => {

    // Todo: split between source and test with differents env

    return gulp.src( [ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*', 'tests/**/*.js' ] )
               .pipe( eslint( {
                   allowInlineConfig: true,
                   globals:           [],
                   fix:               true,
                   quiet:             false,
                   envs:              [],
                   configFile:        './configs/eslint.conf.json',
                   parser:            'babel-eslint',
                   parserOptions:     {
                       ecmaFeatures: {
                           jsx: true
                       }
                   },
                   plugins:           [
                       'react'
                   ],
                   rules:             {
                       "react/jsx-uses-react": "error",
                       "react/jsx-uses-vars":  "error"
                   },
                   useEslintrc:       false
               } ) )
               .pipe( eslint.format( 'stylish' ) )
               .pipe( eslint.failAfterError() )

    // OR

    //    return gulp.src([ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*.js', 'tests/**/*.js' ])
    //               .pipe(standard({
    //                   fix:     true,   // automatically fix problems
    //                   globals: [],  // custom global variables to declare
    //                   plugins: [],  // custom eslint plugins
    //                   envs:    [],     // custom eslint environment
    //                   parser:  'babel-eslint'    // custom js parser (e.g. babel-eslint)
    //               }))
    //               .pipe(standard.reporter('default', {
    //                   breakOnError:   true,
    //                   breakOnWarning: true,
    //                   quiet:          true,
    //                   showRuleNames:  true,
    //                   showFilePath:   true
    //               }))
    //               .pipe(gulp.dest((file) => {
    //                   return file.base
    //               }))

} )

/**
 * @method npm run doc
 * @description Will generate this documentation
 */
gulp.task( 'doc', () => {

    const config = require( './configs/jsdoc.conf' )

    return gulp.src( [ '' ], { read: false } )
               .pipe( jsdoc( config ) )

} )

/**
 * @method npm run test
 * @description Will run unit tests and benchmarks using karma
 */
gulp.task( 'test', ( done ) => {

    runSequence(
        'unit',
        'bench',
        done
    )

} )

/**
 * @method npm run unit
 * @description Will run unit tests using karma
 */
gulp.task( 'unit', () => {

} )

/**
 * @method npm run bench
 * @description Will run benchmarks using karma
 */
gulp.task( 'bench', () => {

} )

/**
 * @private
 * @method gulp _convert-orbit-controls-to-es6-module
 * @description Will convert/patch the orbit controls from three, and output the result under `builds/tmp`. This dependency is required in some Itee client modules.
 */
gulp.task( '_convert-orbit-controls-to-es6-module', () => {

    return gulp.src( './node_modules/three/examples/js/controls/OrbitControls.js' )
               .pipe( inject.prepend( "import {OrthographicCamera} from '../../../node_modules/three/src/cameras/OrthographicCamera'\n" ) )
               .pipe( inject.prepend( "import {PerspectiveCamera} from '../../../node_modules/three/src/cameras/PerspectiveCamera'\n" ) )
               .pipe( inject.prepend( "import {EventDispatcher} from '../../../node_modules/three/src/core/EventDispatcher'\n" ) )
               .pipe( inject.prepend( "import {Quaternion} from '../../../node_modules/three/src/math/Quaternion'\n" ) )
               .pipe( inject.prepend( "import {Spherical} from '../../../node_modules/three/src/math/Spherical'\n" ) )
               .pipe( inject.prepend( "import {Vector3} from '../../../node_modules/three/src/math/Vector3'\n" ) )
               .pipe( inject.prepend( "import {Vector2} from '../../../node_modules/three/src/math/Vector2'\n" ) )
               .pipe( inject.prepend( "import {MOUSE} from '../../../node_modules/three/src/constants'\n" ) )
               .pipe( replace( /THREE.(\w*) = function/g, 'var $1 = function' ) )
               .pipe( replace( 'THREE.', '' ) )
               .pipe( replace( 'rotateStart.copy( rotateEnd );', 'rotateStart.copy( rotateEnd );\n//[TV - PATCH - 28/11/2016] Emit rotate event\nscope.dispatchEvent( { type: \'rotate\' } );' ) )
               .pipe( replace( 'dollyStart.copy( dollyEnd );', 'dollyStart.copy( dollyEnd );\n//[TV - PATCH - 28/11/2016] Emit zoom event\nscope.dispatchEvent( { type: \'zoom\' } );' ) )
               .pipe( replace( 'panStart.copy( panEnd );', 'panStart.copy( panEnd );\n//[TV - PATCH - 28/11/2016] Emit pan event\nscope.dispatchEvent( { type: \'pan\' } );' ) )
               .pipe( inject.append( '\nexport {OrbitControls}\n' ) )
               .pipe( gulp.dest( './sources/third_party/three_extended' ) )

} )

/**
 * @private
 * @method gulp _convert-anaglyph-effect-to-es6-module
 * @description Will convert/patch the anaglyph effect from three, and output the result under `builds/tmp`. This dependency is required in some Itee client modules.
 */
gulp.task( '_convert-anaglyph-effect-to-es6-module', () => {

    return gulp.src( './node_modules/three/examples/js/effects/AnaglyphEffect.js' )
               .pipe( inject.prepend( "import {Matrix3} from '../../../node_modules/three/src/math/Matrix3'\n" ) )
               .pipe( inject.prepend( "import {OrthographicCamera} from '../../../node_modules/three/src/cameras/OrthographicCamera'\n" ) )
               .pipe( inject.prepend( "import {StereoCamera} from '../../../node_modules/three/src/cameras/StereoCamera'\n" ) )
               .pipe( inject.prepend( "import {Scene} from '../../../node_modules/three/src/scenes/Scene'\n" ) )
               .pipe( inject.prepend( "import {LinearFilter} from '../../../node_modules/three/src/constants'\n" ) )
               .pipe( inject.prepend( "import {NearestFilter} from '../../../node_modules/three/src/constants'\n" ) )
               .pipe( inject.prepend( "import {RGBAFormat} from '../../../node_modules/three/src/constants'\n" ) )
               .pipe( inject.prepend( "import {WebGLRenderTarget} from '../../../node_modules/three/src/renderers/WebGLRenderTarget'\n" ) )
               .pipe( inject.prepend( "import {ShaderMaterial} from '../../../node_modules/three/src/materials/ShaderMaterial'\n" ) )
               .pipe( inject.prepend( "import {Mesh} from '../../../node_modules/three/src/objects/Mesh'\n" ) )
               .pipe( inject.prepend( "import {PlaneBufferGeometry} from '../../../node_modules/three/src/geometries/PlaneGeometry'\n" ) )
               .pipe( replace( /THREE.(\w*) = function/g, 'var $1 = function' ) )
               .pipe( replace( 'THREE.', '' ) )
               .pipe( inject.append( '\nexport {AnaglyphEffect}\n' ) )
               .pipe( gulp.dest( './sources/third_party/three_extended' ) )

} )

/**
 * @private
 * @method gulp _convert-stereo-effect-to-es6-module
 * @description Will convert/patch the stereo effect from three, and output the result under `builds/tmp`. This dependency is required in some Itee client modules.
 */
gulp.task( '_convert-stereo-effect-to-es6-module', () => {

    return gulp.src( './node_modules/three/examples/js/effects/StereoEffect.js' )
               .pipe( inject.prepend( "import {StereoCamera} from '../../../node_modules/three/src/cameras/StereoCamera'\n" ) )
               .pipe( replace( /THREE.(\w*) = function/g, 'var $1 = function' ) )
               .pipe( replace( 'THREE.', '' ) )
               .pipe( inject.append( '\nexport {StereoEffect}\n' ) )
               .pipe( gulp.dest( './sources/third_party/three_extended' ) )

} )

/**
 * @private
 * @method gulp _convert-detector-to-es6-module
 * @description Will convert/patch the webgl detector from three, and output the result under `builds/tmp`. This dependency is required in some Itee client modules.
 */
gulp.task( '_convert-detector-to-es6-module', () => {

    return gulp.src( './node_modules/three/examples/js/Detector.js' )
               .pipe( inject.append( '\nexport {Detector}\n' ) )
               .pipe( gulp.dest( './sources/third_party/three_extended' ) )

} )

/**
 * @private
 * @method gulp _extendThree
 * @description Will convert/patch three, and output the result under `builds/tmp`. This dependencies are required in some Itee client modules.
 */
gulp.task( '_extendThree', ( done ) => {

    runSequence(
        'clean',
        [
            '_convert-orbit-controls-to-es6-module',
            '_convert-stereo-effect-to-es6-module',
            '_convert-anaglyph-effect-to-es6-module',
            '_convert-detector-to-es6-module'
        ],
        done
    )

} )

/**
 * @method npm run build
 * @description Will build itee client module using optional arguments, running clean and _extendThree tasks before. See help to further informations.
 */
gulp.task( 'build', [ '_extendThree' ], ( done ) => {

    const options = processArguments( process.argv )
    const configs = createBuildsConfigs( options )

    nextBuild()

    function processArguments ( processArgv ) {
        'use strict'

        let defaultOptions = {
            environments: [ 'development', 'production' ],
            formats:      [ 'amd', 'cjs', 'es', 'iife', 'umd' ],
            sourceMap:    false
        }

        const argv = processArgv.slice( 4 ) // Ignore nodejs, script paths and gulp params
        argv.forEach( argument => {

            if ( argument.indexOf( '-f' ) > -1 || argument.indexOf( '--format' ) > -1 ) {

                const splits    = argument.split( ':' )
                const splitPart = splits[ 1 ]

                defaultOptions.formats = []
                defaultOptions.formats.push( splitPart )

            } else if ( argument.indexOf( '-d' ) > -1 || argument.indexOf( '--dev' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'development' )

            } else if ( argument.indexOf( '-p' ) > -1 || argument.indexOf( '--prod' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'production' )

            } else if ( argument.indexOf( '-s' ) > -1 || argument.indexOf( '--sourcemap' ) > -1 ) {

                defaultOptions.sourceMap = true

            } else {

                throw new Error( `Build Script: invalid argument ${argument}. Type \`npm run help build\` to display available argument.` )

            }

        } )

        return defaultOptions

    }

    function createBuildsConfigs ( options ) {
        'use strict'

        let configs = []

        for ( let formatIndex = 0, numberOfFormats = options.formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {
            const format = options.formats[ formatIndex ]

            for ( let envIndex = 0, numberOfEnvs = options.environments.length ; envIndex < numberOfEnvs ; ++envIndex ) {
                const environment  = options.environments[ envIndex ]
                const onProduction = (environment === 'production')

                const config = require( './configs/rollup.conf' )( format, onProduction, options.sourceMap )

                configs.push( config )
            }
        }

        return configs

    }

    function nextBuild () {
        'use strict'

        if ( configs.length === 0 ) {
            done()
            return
        }

        build( configs.pop(), nextBuild )

    }

    function build ( config, done ) {

        log( `Building ${config.outputOptions.file}` )

        rollup.rollup( config.inputOptions )
              .then( ( bundle ) => {

                  bundle.write( config.outputOptions )
                        .catch( ( error ) => {
                            log( red( error ) )
                            done()
                        } )

                  done()
              } )
              .catch( ( error ) => {
                  log( red( error ) )
                  done()
              } )

    }

} )

/**
 * @method npm run release
 * @description Will perform a complet release of the library.
 */
gulp.task( 'release', ( done ) => {

    runSequence(
        'clean',
        '_extendThree',
        [
            'lint',
            'doc',
            'test'
        ],
        'build',
        done
    )

} )
