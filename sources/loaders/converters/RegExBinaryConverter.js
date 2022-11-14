import { TBinaryConverter } from '../TBinaryConverter'

class RegExBinaryConverter extends TBinaryConverter {
    constructor ( serializer ) { super( RegExp, serializer ) }

    from ( reader, options = {} ) {
        return new RegExp()
    }
}

export { RegExBinaryConverter }
