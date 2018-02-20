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

class TBrand extends React.Component {

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

        const { id, className, icon, label } = this.props

        const _id    = id || `tBrand_${_instanceCounter}`
        const _style = {
            fontSize:   '2em',
            fontWeight: 'bold',
            padding:    '0 10px',
            cursor:     'pointer'
        }
        const _class = ( className ) ? `tBrand ${className}` : 'tBrand'

        return (
            <t-brand id={_id} style={_style} class={_class}>
                <i style={{ marginRight: '3px' }} className={icon}></i>
                {label}
            </t-brand>
        )

    }

}

export { TBrand }

