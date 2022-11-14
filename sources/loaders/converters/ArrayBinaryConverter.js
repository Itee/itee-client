import { TBinaryConverter }        from '../TBinaryConverter'
import { DefaultBinarySerializer } from '../TBinarySerializer'

class ArrayBinaryConverter extends TBinaryConverter {
    constructor ( serializer ) { super( Array, serializer ) }

    to ( writer, instance, options = {} ) {

        const numberOfElements = instance.length
        writer.setUint32( numberOfElements )
        for ( let instanceElement of instance ) {
            //            DefaultBinarySerializer._serialize( instanceElement )
            this.serializer._serialize( instanceElement )
        }

    }
    from ( reader, options = {} ) {

        const numberOfElements = reader.getUint32()
        const result           = []
        for ( let i = 0 ; i < numberOfElements ; i++ ) {
            //            const element = DefaultBinarySerializer._deserialize()
            const element = this.serializer._deserialize()
            result.push( element )
        }

        return result

    }
}

export { ArrayBinaryConverter }
