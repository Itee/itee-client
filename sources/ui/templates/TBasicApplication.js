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

class TBasicApplication extends React.Component {

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

    componentWillReceiveProps ( nextProps ) {}

    shouldComponentUpdate ( nextProps, nextState ) {}

    componentWillUpdate ( nextProps, nextState ) {}

    componentDidUpdate ( prevProps, prevState ) {}

    static componentDidCatch ( error, info ) {

        console.error( error )

    }

    render () {

        const { id, className } = this.props

        const _id = id || `tBasicApplication_${_instanceCounter}`
        const _style = {
            display:  'flex',
            flexFlow: 'column',
            height:   '100%'
        }
        const _class = ( className ) ? `tBasicApplication ${className}` : 'tBasicApplication'

        return (
            <t-basic-application ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}>

            </t-basic-application>
        )

    }

}

export { TBasicApplication }

