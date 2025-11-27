import { Testing }      from 'itee-utils/sources/testings/benchmarks.js'
import * as TBinarySerializerNamespace from '../../../sources/loaders/TBinarySerializer.js'

const isDateSuite = Benchmark.Suite( 'TBinarySerializerNamespace.isDate', Testing.createSuiteOptions() )
                                     .add( 'isDate()', Testing.iterateOverDataMap( TBinarySerializerNamespace.isDate ), Testing.createBenchmarkOptions() )

const isRegExSuite = Benchmark.Suite( 'TBinarySerializerNamespace.isRegEx', Testing.createSuiteOptions() )
                                     .add( 'isRegEx()', Testing.iterateOverDataMap( TBinarySerializerNamespace.isRegEx ), Testing.createBenchmarkOptions() )

export { isDateSuite,isRegExSuite }

