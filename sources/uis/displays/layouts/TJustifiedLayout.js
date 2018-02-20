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

class TJustifiedLayout extends React.Component {

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

    //shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    render () {

        const { id, className, children } = this.props

        const _id    = id || `tJustifiedLayout_${_instanceCounter}`
        const _style = {
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between'
        }
        const _class = ( className ) ? `tJustifiedLayout ${className}` : 'tJustifiedLayout'

        return (
            <t-justified-layout id={_id} style={_style} class={_class}>
                {children}
            </t-justified-layout>
        )

    }

}

export { TJustifiedLayout }
