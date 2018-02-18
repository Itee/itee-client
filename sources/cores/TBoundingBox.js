/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/**
 *
 * @constructor
 */
function TBoundingBox() {
    this.xMin = Number.MAX_VALUE;
    this.xMax = Number.MIN_VALUE;
    this.yMin = Number.MAX_VALUE;
    this.yMax = Number.MIN_VALUE;
    this.zMin = Number.MAX_VALUE;
    this.zMax = Number.MIN_VALUE;
}

Object.assign( TBoundingBox.prototype, {

    /**
     *
     * @param point
     */
    computePoint ( point ) {

        if ( point.x < this.xMin ) {
            this.xMin = point.x;
        }

        if ( point.x > this.xMax ) {
            this.xMax = point.x;
        }

        if ( point.y < this.yMin ) {
            this.yMin = point.y;
        }

        if ( point.y > this.yMax ) {
            this.yMax = point.y;
        }

        if ( point.z < this.zMin ) {
            this.zMin = point.z;
        }

        if ( point.z > this.zMax ) {
            this.zMax = point.z;
        }

    },

    /**
     *
     * @param points
     */
    computePoints ( points ) {

        for ( let i = 0, numPts = points.length ; i < numPts ; ++i ) {
            this.computePoint( points[ i ] );
        }

    },

    /**
     * 
     * @return {{x: number, y: number, z: number}}
     */
    getCenter () {

        return {
            x: (this.xMin + this.xMax) / 2,
            y: (this.yMin + this.yMax) / 2,
            z: (this.zMin + this.zMax) / 2
        }

    }

} )

export { TBoundingBox }
