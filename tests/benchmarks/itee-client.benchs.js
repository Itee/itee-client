/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/* global suite, benchmark */

const IteeClientSuite = suite( 'Itee#Client', () => {

    benchmark(
        'isBenching()',
        function () {

            return true

        },
        {} )

} )

export { IteeClientSuite }
