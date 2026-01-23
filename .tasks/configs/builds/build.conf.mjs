import { createRollupConfigs } from '@itee/tasks/sources/utils/builds.mjs'

export default createRollupConfigs( {
    externalMap: {
        'esm':  [
            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
        'cjs':  [
            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
        'iife': [
            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
    }
} )
