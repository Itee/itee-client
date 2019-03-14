/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TErrorCatcher
 * @classdesc The TErrorCatcher is design to catch all error in compenent using compenentDidCatch methods and display the error where it is located
 *
 * @example
 *
 * <TErrorCatcher></TErrorCatcher>
 *
 */

import PropTypes from 'prop-types'
import React     from 'react'

let _instanceCounter = 0

class TErrorCatcher extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state = {
            error: undefined,
            info:  undefined
        }

        // Handlers binding

    }

    /**
     * Component Life Cycle
     */
    componentDidCatch ( error, info ) {

        this.setState( {
            error,
            info
        } )

    }

    /**
     * Component Rendering
     */

    render () {

        const { id, className } = this.props

        const _id    = id || `tErrorCatcher_${_instanceCounter}`
        const _class = ( className ) ? `tErrorCatcher ${className}` : 'tErrorCatcher'

        const _style = {}

        if ( this.state.error ) {
            return (
                <t-error-catcher ref={( container ) => {this._container = container}} id={_id} style={_style} class={_class}>
                    <h1>Error: {this.state.error.toString()}</h1>
                    <div>Info: {this.state.info.toString()} </div>
                </t-error-catcher>
            )
        }
        return this.props.children

    }

}

TErrorCatcher.propType = {
    id:        PropTypes.string,
    className: PropTypes.string
}

export { TErrorCatcher }
