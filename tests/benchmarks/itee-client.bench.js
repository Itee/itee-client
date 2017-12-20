/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
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
