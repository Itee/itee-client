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

class TSplitter extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state = {
            isVertical:            true,
            onTracking:            false,
            initialMousePositionX: 0,
            initialMousePositionY: 0,
            position:              (props.initPosition) ? props.initPosition : 50
        }

        this.onMouseDownHandler = this.onMouseDownHandler.bind( this )
        this.onMouseMoveHandler = this.onMouseMoveHandler.bind( this )
        this.onMouseUpHandler   = this.onMouseUpHandler.bind( this )

    }

    onMouseDownHandler ( event ) {

        this.setState( {
            onTracking:            true,
            initialMousePositionX: event.clientX,
            initialMousePositionY: event.clientY
        } )

        event.preventDefault()

    }

    onMouseMoveHandler ( event ) {

        if ( !this.state.onTracking ) {
            return
        }

        const splitterElement = document.getElementById( 'tSplitterId' )

        let position = 0
        if ( this.state.isVertical ) {
            position = ( 100 * (event.clientX - splitterElement.offsetLeft) ) / splitterElement.clientWidth
        } else {
            position = ( 100 * (event.clientY - splitterElement.offsetTop) ) / splitterElement.clientHeight
        }

        this.setState( { position: position } )

        event.preventDefault()

    }

    onMouseUpHandler ( event ) {

        this.setState( { onTracking: false } )

        event.preventDefault()

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

        const { id, className, first, second } = this.props

        const _id           = id || `tSplitter_${_instanceCounter}`
        const _class        = ( className ) ? `tSplitter ${className}` : 'tSplitter'
        let _style          = {}
        let _firstStyle     = {}
        let _secondStyle    = {}
        let _separatorStyle = {}

        const leftWidth  = this.state.position
        const rightWidth = 100 - leftWidth

        if ( this.state.isVertical ) {

            _style = {
                display: 'flex',
                width:   '100%'
            }

            _firstStyle = {
                width: leftWidth + '%'
            }

            _secondStyle = {
                width: rightWidth + '%'
            }

            _separatorStyle = {
                minWidth: '1px',
                cursor:   'col-resize'
            }

        } else {

            _style = {
                display:  'flex',
                flexFlow: 'column',
                width:    '100%'
            }

            _firstStyle = {
                height: leftWidth + '%',
                width:  '100%'
            }

            _secondStyle = {
                height: rightWidth + '%',
                width:  '100%'
            }

            _separatorStyle = {
                minHeight: '1px',
                cursor:    'row-resize',
                width:     '100%'
            }

        }

        return (
            <t-splitter id={_id} className={_class} style={_style} onMouseMove={this.onMouseMoveHandler} onMouseUp={this.onMouseUpHandler} onMouseLeave={this.onMouseUpHandler}>
                <div id={`tLeftSplit_${_instanceCounter}`} className={'tSplit tLeftSplit'} style={_firstStyle}>
                    {first}
                </div>
                <div id={`tSplitterSeparator_${_instanceCounter}`} className={'tSplitterSeparator'} style={_separatorStyle} onMouseDown={this.onMouseDownHandler}></div>
                <div id={`tRightSplit_${_instanceCounter}`} className={'tSplit tRightSplit'} style={_secondStyle}>
                    {second}
                </div>
            </t-splitter>
        )

    }

}

export { TSplitter }
