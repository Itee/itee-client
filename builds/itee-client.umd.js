(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Itee = {})));
}(this, (function (exports) { 'use strict';

  /**
   * @author Tristan Valcke <valcketristan@gmail.com>
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   * @see https://github.com/Itee
   *
   * @file The main entry point for Itee-Client, it contains all exports of the library
   *
   */

  /**
   * Class representing the main application
   *
   * @class
   */
  var Application = function Application () {};

  Application.prototype.start = function start () {
      alert('Hello World !');
  };

  exports.Application = Application;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
