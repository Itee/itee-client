import { TBinaryConverter }        from '../TBinaryConverter'
import { DefaultBinarySerializer } from '../TBinarySerializer'

class DateBinaryConverter extends TBinaryConverter {
    constructor ( serializer ) { super( Date, serializer ) }

    to ( writer, instance, options = {} ) {
        const utc = instance.toUTCString()
        this.serializer._serialize( utc )
//        DefaultBinarySerializer._serialize( utc )
    }

    from ( reader, options = {} ) {
        const utcString = this.serializer._deserialize()
//        const utcString = DefaultBinarySerializer._deserialize()
        return new Date( utcString )
    }
}

export { DateBinaryConverter }
