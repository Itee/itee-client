import { TBinaryConverter } from '../TBinaryConverter'

class UndefinedBinaryConverter extends TBinaryConverter {
    constructor ( serializer ) { super( null, serializer ) }

    to ( writer, instance, options = {} ) {}

    from ( reader, options = {} ) {
        return undefined
    }
}

export { UndefinedBinaryConverter }
