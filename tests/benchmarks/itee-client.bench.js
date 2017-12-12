/**
 * @author Tristan Valcke <valcketristan@gmail.com>
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @see https://github.com/Itee
 *
 * @file The main entry point about benchmarks of the library
 *
 */

/* global suite, benchmark */

suite('Array iteration', function () {
  benchmark('native forEach', function () {
    [ 1, 2, 3 ].forEach(function (el) {
      return el
    })
  })
})
