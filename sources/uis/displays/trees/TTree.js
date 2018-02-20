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

class TTree extends React.Component {

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

        const { id, className, header, children } = this.props

        const _id    = id || `tTree_${_instanceCounter}`
        const _style = {
            overflowY: 'auto',
            padding:   '5px',
            height:    '100%'
        }
        const _class = ( className ) ? `tTree ${className}` : 'tTree'

        return (
            <div id={_id} className={_class} style={_style}>
                <div className={'tTreeHeader'}>
                    {header}
                </div>
                <div className={'tTreeContent'}>
                    {children}
                </div>
            </div>
        )

        //        return (
        //            <t-tree ref={( container ) => {this._container = container}} id={_id} style={_style} class={_class}></t-tree>
        //        )

    }

}

export { TTree }
