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

let _instanceCounter = 0

class TMenuItem extends React.Component {

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

        const { id, className, icon, label, target, tooltip, clickHandler } = this.props

        const _id    = id || `tMenuItem_${_instanceCounter}`
        const _style = {}
        const _class = ( className ) ? `tMenuItem ${className}` : 'tMenuItem'

        const menuItemStyle = {
            float: 'left'
        }

        const linkStyle = {
            display:        'block',
            color:          'white',
            fontSize:       '1.6em',
            textAlign:      'center',
            padding:        '14px 16px',
            textDecoration: 'none'
        }

        if ( icon ) {

            return (
                <li className={'tMenuItem'} style={menuItemStyle}>
                    <a id={id} style={linkStyle} href={target} title={tooltip} onClick={clickHandler}>
                        <i className={icon}></i>
                        {label}
                    </a>
                </li>
            )

        } else {

            return (
                <li className={'tMenuItem'} style={menuItemStyle}>
                    <a id={id} style={linkStyle} href={target} title={tooltip} onClick={clickHandler}>{label}</a>
                </li>
            )

        }


//        return (
//            <t-menu-item ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-menu-item>
//        )

    }

}

export { TMenuItem }
