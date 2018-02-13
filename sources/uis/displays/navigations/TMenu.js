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

import React from 'react'

let _instanceCounter = 0

class TMenu extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

    }

    /**
     * React lifecycle
     */
    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    componentWillReceiveProps ( /*nextProps*/ ) {}

    shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    render () {

        const { id, className, value, onChangeHandler, children } = this.props

        const _id    = id || `tMenu_${_instanceCounter}`
        const _style = {
            listStyleType: 'none',
            margin:        0,
            padding:       0
        }
        const _class = ( className ) ? `tMenu ${className}` : 'tMenu'

        return (
            <ul style={_style}>{children}</ul>
        )

//        return (
//            <t-menu ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-menu>
//        )

    }

}

export { TMenu }
