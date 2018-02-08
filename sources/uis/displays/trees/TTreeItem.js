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

class TTreeItem extends React.Component {

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

        const { id, className, name, isChecked, children } = this.props

        const _id    = id || `tTreeItem_${_instanceCounter}`
        const _style = {}
        const _class = ( className ) ? `tTreeItem ${className}` : 'tTreeItem'

        return (
            <li id={id} className={'tTreeItem'}>
                <input type={"checkbox"} id={`${id}ExpandCheckbox`} />
                <label>
                    <input type={"checkbox"} id={`${id}VisibilityCheckbox`} checked={isChecked} />
                    <span></span>
                </label>
                <label htmlFor={`${id}ExpandCheckbox`}>{name}</label>
                <ul className={"children"}>
                    {children}
                </ul>
            </li>
        )

//        return (
//            <t-tree-item ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-tree-item>
//        )

    }

}

export { TTreeItem }
