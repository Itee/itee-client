import { TBinaryConverter }        from '../TBinaryConverter'
import { DefaultBinarySerializer } from '../TBinarySerializer'

class ObjectBinaryConverter extends TBinaryConverter {
    constructor ( subType, serializer ) { super( subType || Object, serializer ) }

    to ( writer, instance, options = {} ) {

        // Keep only writable properties from instance
        // Read-only property are considered as it ! And won't be serialized.
        const descriptors             = Object.getOwnPropertyDescriptors( instance )
        const writablePropertyEntries = Object.entries( descriptors )
                                              .filter( ( [ key, value ] ) => value.writable && value.enumerable )

        // Store number of writable properties of object for future deserialization loop
        writer.setUint8( writablePropertyEntries.length )

        for ( let [ key, property ] of writablePropertyEntries ) {
            //            console.log( key, property.value )

            writer.setUint32( key.length )
            writer.setString( key )

            // target private method to allow buffer clipping on serialization
            this.serializer._serialize( property.value )
//            DefaultBinarySerializer._serialize( property.value )
        }

        //        const instanceKeys = Object.keys( instance )
        //        console.log( instanceKeys )
        //
        //        const instanceEntries = Object.entries( instance )
        //        console.log( instanceEntries )
        //
        //        const descriptors = Object.getOwnPropertyDescriptors( instance )
        //        for ( let descriptor in descriptors ) {
        //            if ( !instanceKeys.includes( descriptor ) ) { continue }
        //
        //
        //            if ( !descriptor.writable ) { continue }
        //
        //
        //        }
        //
        //        const descKeys = Object.keys( descriptors )
        //        console.log( descKeys )
        //
        //        const descEntries = Object.entries( descriptors )
        //        console.log( descEntries )
        //
        //        const filteredVals = Object.values( descriptors )
        //                                   .filter( value => value.writable )
        //        console.log( filteredVals )
        //
        //        const filtered = descEntries.filter( ( [ key, value ] ) => value.writable && value.enumerable )
        //        console.log( filtered )

        // Store number of object keys for deserialization loop
        //        const keys = Object.keys( instance )
        //        writer.setUint8( keys.length )
        //
        //        for ( let key of keys ) {
        //            if ( !instance.hasOwnProperty( key ) ) { continue }
        //
        //            writer.setUint32( key.length )
        //            writer.setString( key )
        //
        //            TBinarySerializer.serialize( instance[ key ] )
        //        }

    }

    from ( reader, options = {} ) {
        const instance = super.from( reader, options )


        //        const descriptors        = Object.getOwnPropertyDescriptors( instance )
        //        const result             = {}
        const numberOfProperties = reader.getUint8()
        for ( let i = 0 ; i < numberOfProperties ; i++ ) {
            const keyLength = reader.getUint32()
            const keyName   = reader.getString( keyLength )

            instance[ keyName ] = this.serializer._deserialize()
//            instance[ keyName ] = DefaultBinarySerializer._deserialize()
            //
            //            const descriptor = descriptors[ keyName ]
            //
            //            if ( descriptor.writable ) {
            //                instance[ keyName ] = TBinarySerializer._deserialize()
            //            } else {
            //                var deseri = TBinarySerializer._deserialize()
            //            }
        }
        return instance

    }
}

export { ObjectBinaryConverter }
