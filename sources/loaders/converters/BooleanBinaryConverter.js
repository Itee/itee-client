/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import { TBinaryConverter } from '../TBinaryConverter'

class BooleanBinaryConverter extends TBinaryConverter {

    constructor ( serializer ) { super( Boolean, serializer ) }

    to ( writer, instance, options = {} ) {

        writer.setBoolean( instance )

    }

    from ( reader, options = {} ) {

        return reader.getBoolean()

    }
}

export { BooleanBinaryConverter }
