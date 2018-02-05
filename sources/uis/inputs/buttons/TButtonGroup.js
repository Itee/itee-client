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

class TButtonGroup extends React.Component {

    constructor ( props ) {

        super( props )

    }

    render () {

        const props = this.props

        const buttonGroupStyle = {
            listStyleType: 'none',
            display:       'flex',
            alignItems:    'center',
            margin:        0,
            padding:       0
        }

        return (
            <ul style={buttonGroupStyle}>
                {props.children}
            </ul>
        )

    }

}

export { TButtonGroup }
