import { TBinaryConverter } from '../TBinaryConverter.js'

class NumberBinaryConverter extends TBinaryConverter {
    constructor( serializer ) { super( Number, serializer ) }

    to( writer, instance, options = {} ) {
        writer.setFloat64( instance )
    }

    from( reader, options = {} ) {
        return reader.getFloat64()
    }
}

export { NumberBinaryConverter }
