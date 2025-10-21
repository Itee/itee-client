const lintConf = [
    'configs/**/*.js',
    'sources/**/*.js',
    'tests/**/*.js',
    '!tests/**/builds/*.js',
    '!tests/bundles/**/*.js',
    '!tests/WebApi/**/*.js'
]

export { lintConf }