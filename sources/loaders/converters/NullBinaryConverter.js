import { TBinaryConverter } from '../TBinaryConverter'

class NullBinaryConverter extends TBinaryConverter {
    constructor ( serializer ) { super( null, serializer ) }

    to ( writer, instance, options = {} ) {}

    from ( reader, options = {} ) {
        return null
    }
}

export { NullBinaryConverter }
