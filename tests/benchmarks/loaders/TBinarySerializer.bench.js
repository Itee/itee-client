import * as TBinarySerializerNamespace from '../../../sources/loaders/TBinarySerializer.js'
import { getBenchmarkPackage } from '../../import.benchmarks.js'
import { getTestingPackage } from '../../import.testing.js'

const Benchmark = await getBenchmarkPackage()
const Testing   = await getTestingPackage()

const isDateSuite = Benchmark.Suite( 'TBinarySerializerNamespace.isDate', Testing.createSuiteOptions() )
                                     .add( 'isDate()', Testing.iterateOverDataMap( TBinarySerializerNamespace.isDate ), Testing.createBenchmarkOptions() )

const isRegExSuite = Benchmark.Suite( 'TBinarySerializerNamespace.isRegEx', Testing.createSuiteOptions() )
                                     .add( 'isRegEx()', Testing.iterateOverDataMap( TBinarySerializerNamespace.isRegEx ), Testing.createBenchmarkOptions() )

export { isDateSuite,isRegExSuite }

