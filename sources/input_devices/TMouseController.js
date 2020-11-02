/* eslint-env browser */

/**
 * @class
 * @classdesc TMouseController allow single source of thruth for mouse state checking
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 * (1) create a global variable:
 *      var keyboard = new TKeyboardController();
 * (2) during main loop:
 *       keyboard.update();
 * (3) check state of keys:
 *       keyboard.down("A")    -- true for one update cycle after key is pressed
 *       keyboard.pressed("A") -- true as long as key is being pressed
 *       keyboard.up("A")      -- true for one update cycle after key is released
 *
 *  See TKeyboardController.k object data below for names of keys whose state can be polled
 */
class TMouseController {

    /**
     * @constructor
     */
    constructor ( /*parameters = {}*/ ) {

    }

}

export { TMouseController }
