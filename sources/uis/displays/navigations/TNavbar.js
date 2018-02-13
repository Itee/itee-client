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

class TNavbar extends React.Component {

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

        const { id, className, state, position, children } = this.props

        const _id    = id || `tNavbar_${_instanceCounter}`
        const _style = {
            backgroundColor: '#323232',
            position:        'fixed',
            height:          '40px',
            borderTop:       '1px solid rgb(30, 30, 30)',
            display:         'flex',
            alignItems:      'center'
        }
        const _class = ( className ) ? `tNavbar ${className}` : 'tNavbar'

        switch ( state ) {

            case 'fixed':
                _style[ 'position' ] = 'fixed'
                break

            case 'toggle':

                break

            case 'float':
                _style[ 'position' ] = 'absolute'
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${state}`, 'TNavbar', 40 )
                break

        }

        switch ( position ) {

            case 'top':
                _style[ 'top' ]   = '0px'
                _style[ 'width' ] = '100%'
                break

            case 'right':
                _style[ 'right' ]  = '0px'
                _style[ 'height' ] = '100%'
                break

            case 'bottom':
                _style[ 'bottom' ] = '0px'
                _style[ 'width' ]  = '100%'
                break

            case 'left':
                _style[ 'left' ]   = '0px'
                _style[ 'height' ] = '100%'
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${position}`, 'TNavbar', 70 )
                break

        }

        return (
            <t-navbar id={_id} className={_class} style={_style}>
                {children}
            </t-navbar>
        )

    }

}

export { TNavbar }

