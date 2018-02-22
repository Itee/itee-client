/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import React from 'react'
import ReactDOM from 'react-dom'
import * as Ui from '../uis/_uis'
import { isObject } from '../validators/TObjectValidator'
import { TApplication } from '../uis/templates/TApplication'
import { _Math } from 'threejs-full-es6'

/**
 *
 * @constructor
 */
function TApplicationFactory () {}

Object.assign( TApplicationFactory, {

    /**
     *
     * @param view
     * @param model
     * @param container
     */
    createApplication ( parameters ) {
        //    createApplication ( view, model, container ) {

        const view      = parameters.view
        const model     = parameters.model
        const container = parameters.container

        ReactDOM.render(
            React.createElement(
                TApplication,
                model,
                TApplicationFactory._getChildren( view )
            ),
            document.querySelector( container )
        )

    },

    /**
     *
     * @param componentData
     * @return {*}
     * @private
     */
    _createApplicationComponents ( componentData ) {

        const componentType     = TApplicationFactory._getType( componentData.type )
        const componentProps    = TApplicationFactory._getProperties( componentData.props )
        const componentChildren = TApplicationFactory._getChildren( componentData.children )

        return (componentChildren) ? React.createElement( componentType, componentProps, componentChildren ) : React.createElement( componentType, componentProps )

    },

    _getType ( type ) {

        return Ui[ type ]

    },

    _getProperties ( properties ) {

        let _properties = {}

        for ( let propertyName in properties ) {

            if ( !properties.hasOwnProperty( propertyName ) ) {
                continue
            }

            const property              = properties[ propertyName ]
            _properties[ propertyName ] = ( isObject( property ) ) ? TApplicationFactory._createApplicationComponents( property ) : property

        }

        if( !_properties.key ) {
            _properties.key = _Math.generateUUID()
        }

        return _properties

    },

    /**
     *
     * @param childrenDatas
     * @return {*}
     * @private
     */
    _getChildren ( childrenDatas ) {

        if ( !childrenDatas || childrenDatas.length === 0 ) {
            return null
        }

        let children = []
        for ( let childIndex = 0, numberOfChildren = childrenDatas.length ; childIndex < numberOfChildren ; childIndex++ ) {
            children.push( TApplicationFactory._createApplicationComponents( childrenDatas[ childIndex ] ) )
        }
        return children

    }

} )

export { TApplicationFactory }
