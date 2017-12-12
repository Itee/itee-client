/* eslint-env node */

const path        = require( 'path' )
const buble       = require( 'rollup-plugin-buble' )
const nodeResolve = require( 'rollup-plugin-node-resolve' )
const commonJs    = require( 'rollup-plugin-commonjs' )
const replace     = require( 'rollup-plugin-replace' )
const uglify      = require( 'rollup-plugin-uglify-es' )

module.exports = function rollupConfigure ( format, onProduction, wantSourceMap ) {

    const _format        = format || 'umd'
    const _onProduction  = onProduction || false
    const _wantSourceMap = wantSourceMap || false

    const fileName       = 'itee-client'
    const fileExtension  = (_onProduction) ? '.min.js' : '.js'
    const inputFilePath  = path.join( __dirname, '..', 'sources/' + fileName + '.js' )
    const outputFilePath = path.join( __dirname, '..', 'builds/' + fileName + '.' + _format + fileExtension )

    return {
        inputOptions:  {

            // core options
            input:    inputFilePath,
            external: [],
            plugins:  [
                buble(),
                commonJs( {
                    include: 'node_modules/**'
                } ),
                replace( {
                    'process.env.NODE_ENV': JSON.stringify( (_onProduction) ? 'production' : 'development' )
                } ),
                nodeResolve(),
                onProduction && uglify()
            ],

            // advanced options
            onwarn: function onWarn ( { loc, frame, message } ) {
                // print location if applicable
                if ( loc ) {
                    process.stderr.write( `${loc.file} (${loc.line}:${loc.column}) ${message}` )
                    if ( frame ) {
                        process.stderr.write( frame )
                    }
                } else {
                    process.stderr.write( message )
                }
            },
            cache:  undefined,

            // danger zone
            acorn:         undefined,
            context:       undefined,
            moduleContext: {},
            legacy:        undefined
        },
        outputOptions: {
            // core options
            file:    outputFilePath,
            format:  format,
            name:    'Itee',
            globals: {},

            // advanced options
            paths:     {},
            banner:    '',
            footer:    '',
            intro:     '',
            outro:     '',
            sourcemap: _wantSourceMap,
            interop:   true,

            // danger zone
            exports: 'auto',
            amd:     {},
            indent:  '  ',
            strict:  true
        }

    }

}
