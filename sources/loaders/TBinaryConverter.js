//import { DefaultBinarySerializer } from './TBinarySerializer'

class TBinaryConverter {

    constructor ( targetType, serializer = null ) {
//    constructor ( targetType, serializer = DefaultBinarySerializer ) {

        this.targetCtor = targetType
        this.serializer = serializer

    }

    /**
     *
     * @param {TBinaryWriter} writer
     * @param instance
     * @param options
     */
    to ( writer, instance, options = {} ) { }

    /**
     *
     * @param {TBinaryReader} reader
     * @param options
     * @returns {*}
     */
    from ( reader, options = {} ) {

        return new this.targetCtor()

    }

}

export { TBinaryConverter }
