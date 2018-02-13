/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TToolBar
 * @classdesc The TToolBar is a generic container for TToolButtons
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import React from 'react'
import PropTypes from 'prop-types'

let _instanceCounter = 0

class TToolBar extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

    }

    render () {

        const { id, className } = this.props

        const _id    = id || `tToolBar_${_instanceCounter}`
        const _class = ( className ) ? `tToolBar ${className}` : 'tToolBar'
        const _style = {
            display:    'flex',
            alignItems: 'center'
        }

        return (
            <t-tool-bar id={_id} style={_style} className={_class}></t-tool-bar>
        )

    }

}

TToolBar.propType = {
    id:        PropTypes.string,
    className: PropTypes.string
}

export { TToolBar }
