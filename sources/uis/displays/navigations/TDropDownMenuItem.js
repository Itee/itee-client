/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDropDownMenuItem
 * @classdesc The TDropDownMenuItem is design to do...
 *
 * @example
 *
 * <TDropDownMenuItem></TDropDownMenuItem>
 *
 */

import React from 'react'
import PropTypes from 'props-types'

let _instanceCounter = 0

class TDropDownMenuItem extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state = {}

        // Handlers binding

    }

    /**
     * Component Life Cycle
     */

    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    componentWillReceiveProps ( nextProps ) {}

//    shouldComponentUpdate ( nextProps, nextState ) {}

    componentWillUpdate ( nextProps, nextState ) {}

    componentDidUpdate ( prevProps, prevState ) {}


    /**
     * Component Handlers
     */


    /**
     * Component Methods
     */


    /**
     * Component Rendering
     */

    render () {

        const { id, className, label } = this.props

        const _id = id || `tDropDownMenuItem_${_instanceCounter}`
        const _class = ( className ) ? `tDropDownMenuItem ${className}` : 'tDropDownMenuItem'

        const _style = {}

        return (
            <t-drop-down-menu-item id={_id} style={_style} className={_class}>{label}</t-drop-down-menu-item>
        )

    }

}


TDropDownMenuItem.propType = {
    id: PropTypes.string,
    className: PropTypes.string
}

export { TDropDownMenuItem }
