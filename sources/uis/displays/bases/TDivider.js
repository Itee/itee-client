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

class TDivider extends React.Component {

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

        const { id, className, orientation } = this.props

        const _id    = id || `tDivider_${_instanceCounter}`
        const _style = TDivider._computeStyle( orientation )
        const _class = ( className ) ? `tDivider ${className}` : 'tDivider'

        return (
            <t-divider id={_id} style={_style} className={_class} role={'separator'}></t-divider>
        )

    }

    // Private stuff
    static _computeStyle ( orientation ) {

        let style = undefined

        if ( !orientation || orientation === 'vertical' ) {

            style = {
                height:          '30px',
                width:           '1px',
                backgroundColor: '#9d9d9d',
                margin:          '5px 0px'
            }

        } else {

            style = {
                height:          '1px',
                width:           '30px',
                backgroundColor: '#9d9d9d',
                margin:          '5px 0px'
            }

        }

        return style

    }

}

export { TDivider }

