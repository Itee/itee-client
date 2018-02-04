/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TAppBar
 * @classdesc The status bar is design to be on bottom of the page, and should contain some text display and/or data about the application status.
 *
 * @example
 *
 * <TStatusBar>
 *     application ready
 * </TStatusBar>
 *
 */

import React from 'react'

class TStatusBar extends React.Component {

    render () {

        const { id, state, position, children } = this.props

        const _id = id || 'tStatusBar'

        let _style = {
            height:          '40px',
            display:         'flex',
            alignItems:      'center'
        }

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
                throw new RangeError( `Invalid state parameter: ${state}`, 'TStatusBar' )
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
                throw new RangeError( `Invalid position parameter: ${position}`, 'TStatusBar' )
                break

        }

        return (
            <t-status-bar id={_id} style={_style} className={'tStatusBar'}>
                {children}
            </t-status-bar>
        )

    }

}

export { TStatusBar }
