import js      from '@eslint/js'
import mocha   from 'eslint-plugin-mocha'
import {
    defineConfig,
    globalIgnores
}              from 'eslint/config'
import globals from 'globals'


export default defineConfig( [
    globalIgnores( [
        '.github',
        '.idea',
        'builds',
        'docs',
        'tests/WebApi'
    ] ),
    {
        linterOptions: {
            noInlineConfig:                false,
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs:     'error'
        }
    },
    {
        name:    'sources/common',
        files:   [ 'sources/**/*.js' ],
        ignores: [
            'sources/managers/TDataBaseManager.js',
            'sources/webapis/WebAPI.js',
            'sources/workers/AbstractWorker.js',
            'sources/input_devices/TKeyboardController.js',
        ],
        plugins: { js },
        extends: [ 'js/recommended' ],
        rules:   {
            'no-multiple-empty-lines':  [
                'error',
                {
                    'max': 2
                }
            ],
            'no-mixed-spaces-and-tabs': 'error',
            'no-console':               'warn',
            'no-unused-vars':           'warn',
            'no-multi-spaces':          [
                'error',
                {
                    'exceptions': {
                        'Property':             true,
                        'ImportDeclaration':    true,
                        'VariableDeclarator':   true,
                        'AssignmentExpression': true
                    }
                }
            ],
            'key-spacing':              [
                'error',
                {
                    'align': {
                        'beforeColon': false,
                        'afterColon':  true,
                        'on':          'value'
                    }
                }
            ]
        }
    },
    {
        name:            'sources/frontend',
        files:           [
            'sources/managers/TDataBaseManager.js',
            'sources/webapis/WebAPI.js',
            'sources/workers/AbstractWorker.js',
            'sources/input_devices/TKeyboardController.js',
            'sources/loaders/TBinarySerializer.js'
        ],
        ignores:         [],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: { globals: globals.browser }
    },
    {
        name:  'sources/expected_rules',
        files: [ 'sources/webapis/WebAPI.js' ],
        rules: {
            'no-unused-vars': 'warn'
        }
    },
    {
        name:  'sources/expected_rules',
        files: [ 'sources/loaders/TBinarySerializer.js' ],
        rules: {
            'no-unused-vars': 'warn'
        }
    },
    // {
    //     name:            'sources/backend',
    //     files:           [],
    //     ignores:         [],
    //     plugins:         { js },
    //     extends:         [ 'js/recommended' ],
    //     languageOptions: { globals: globals.node }
    // },
    {
        name:    'tests/benchmarks',
        files:   [ 'tests/benchmarks/**/*.js' ],
        ignores: [ 'tests/benchmarks/builds/*' ],
        plugins: { js },
        extends: [ 'js/recommended' ],
    },
    {
        name:            'tests/units',
        files:           [ 'tests/units/**/*.js' ],
        ignores:         [ 'tests/units/builds/*' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: {
            globals: {
                global: 'readonly',
                window: 'readonly',
            },
        }
    },
    {
        files:   [ 'tests/units/**/*.js' ],
        ignores: [ 'tests/units/builds/*' ],
        ...mocha.configs.all
    },
] )
