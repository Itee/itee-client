import {isDateSuite, isRegExSuite} from './loaders/TBinarySerializer.bench.js'

const suites = [
	isDateSuite,
	isRegExSuite
]

for ( const suite of suites ) {
	suite.run()
}
