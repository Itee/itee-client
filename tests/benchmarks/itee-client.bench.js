/* global suite, benchmark */

suite('Array iteration', function () {
  benchmark('native forEach', function () {
    [ 1, 2, 3 ].forEach(function (el) {
      return el
    })
  })
})
