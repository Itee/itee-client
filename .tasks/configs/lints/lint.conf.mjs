import {
    Configurator,
    MochaRecommendedRulesSet,
    RulesSet,
    SourceFrontendRulesSet,
    SourceRulesSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet
} from '@itee/tasks/sources/lints/lint.conf.mjs'

SourceRulesSet.ignores                   = [
    'sources/managers/TDataBaseManager.js',
    'sources/webapis/WebAPI.js',
    'sources/workers/AbstractWorker.js',
    'sources/input_devices/TKeyboardController.js',
]
SourceRulesSet.rules[ 'no-console' ]     = 'warn'
SourceRulesSet.rules[ 'no-unused-vars' ] = 'warn'

SourceFrontendRulesSet.files = [
    'sources/managers/TDataBaseManager.js',
    'sources/webapis/WebAPI.js',
    'sources/workers/AbstractWorker.js',
    'sources/input_devices/TKeyboardController.js',
    'sources/loaders/TBinarySerializer.js'
]

const webApiRuleSet = new RulesSet( {
    name:  'sources/expected_rules',
    files: [ 'sources/webapis/WebAPI.js' ],
    rules: {
        'no-unused-vars': 'warn'
    }
} )

const binarySerializerRuleSet = new RulesSet( {
    name:  'sources/expected_rules',
    files: [ 'sources/loaders/TBinarySerializer.js' ],
    rules: {
        'no-unused-vars': 'warn'
    }
} )

Configurator.globalIgnores.push( 'tests/WebApi' )
Configurator.rulesSets = [
    SourceRulesSet,
    SourceFrontendRulesSet,
    webApiRuleSet,
    binarySerializerRuleSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet,
    MochaRecommendedRulesSet
]

export default Configurator.getConfig()
