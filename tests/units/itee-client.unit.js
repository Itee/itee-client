/**
 * @author Tristan Valcke <valcketristan@gmail.com>
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @see https://github.com/Itee
 *
 * @file The main entry point about unit tests of the library
 *
 */

/* global describe, beforeEach, before, after, afterEach, context, it */

describe( 'Array', () => {

    beforeEach( () => {
        // runs before each test in this block
    } )

    before( () => {
        // runs before all tests in this block
    } )

    after( () => {
        // runs after all tests in this block
    } )

    afterEach( () => {
        // runs after each test in this block
    } )

    describe( '#indexOf()', () => {

        context( 'when not present', () => {

            it( 'should return -1', () => {

                [ 1, 2, 3 ].indexOf( 4 ).should.equal( -1 )

            } )

        } )

    } )

} )
