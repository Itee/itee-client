/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TFile is an helper class to handle file loading edge case
 *
 * @example Todo
 *
 */

/* eslint-env browser */

const FileFormat = Object.freeze( {
    Asc:  'asc',
    Dbf:  'dbf',
    Fbx:  'fbx',
    Mtl:  'mtl',
    Json: 'json',
    Obj:  'obj',
    Shp:  'shp',
    Stl:  'stl',

    toString () {

        const formats = Object.values( this )
        let result    = ''
        for ( let index = 0, numberOfFormats = formats.length ; index < numberOfFormats ; index++ ) {
            result += formats[ index ]
            result += ((index === numberOfFormats - 1) ? ', ' : '.')
        }

    }
} )

function TFile ( path = '' ) {

    let _basePath  = undefined
    let _name      = undefined
    let _extension = undefined
    let _size      = undefined

    Object.defineProperties( this, {
        path:      {
            enumerable: true,
            get () {
                return _basePath + _name;
            },
            set ( newPath ) {
                path = newPath
            }
        },
        basePath:  {},
        name:      {},
        extension: {},
    } );

}

export { FileFormat, TFile }
