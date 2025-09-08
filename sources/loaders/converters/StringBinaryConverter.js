/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import { TBinaryConverter } from '../TBinaryConverter'

class StringBinaryConverter extends TBinaryConverter {

    constructor ( serializer ) { super( String, serializer ) }

    to ( writer, instance, options = {} ) {

        writer.setUint32( instance.length )
        writer.setString( instance )

    }

    from ( reader, options = {} ) {

        const stringLength = reader.getUint32()
        return reader.getString( stringLength )

    }
}

export { StringBinaryConverter }
