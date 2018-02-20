/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDateTime
 * @classdesc The TDateTime is design to do...
 *
 * @example
 *
 * <TDateTime></TDateTime>
 *
 */

/* eslint-env browser */

import React from 'react'
import PropTypes from 'prop-types'

let _instanceCounter = 0

class TDateTime extends React.Component {

    static defaultProps = {
        refreshInterval: 1000
    }

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state = {
            date: new Date()
        }

        this._timerID = undefined

        // Handlers binding

    }

    /**
     * Component Life Cycle
     */


//    componentWillMount () {}

    componentDidMount () {

        this._timerID = setInterval(
            () => this.tick(),
            this.props.refreshInterval
        )

    }

    componentWillUnmount () {

        clearInterval( this._timerID )

    }

    componentWillReceiveProps ( /*nextProps*/ ) {}

    shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    /**
     * Component Handlers
     */

    /**
     * Component Methods
     */
    tick () {

        this.setState( {
            date: new Date()
        } )

    }

    /**
     * Component Rendering
     */

    render () {

        const { id, className } = this.props

        const _id    = id || `tDateTime_${_instanceCounter}`
        const _class = ( className ) ? `tDateTime ${className}` : 'tDateTime'

        const _style = {}

        return (
            <t-date-time id={_id} style={_style} class={_class} />
        )

    }

}

/**
 * Class props type checking
 */
TDateTime.propType = {
    id:        PropTypes.string,
    className: PropTypes.string
}

export { TDateTime }
