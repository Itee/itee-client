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

import { THeader } from '../../displays/sections/THeader'
import { TContent } from '../../displays/sections/TContent'
import { TFooter } from '../../displays/sections/TFooter'

import { TCentererLayout } from '../../displays/layouts/TCentererLayout'

let _instanceCounter = 0

class TLoginDialog extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state        = { value: '' };
        this.handleChange = this.handleChange.bind( this )

    }

    handleChange ( event ) {

        this.setState( { value: event.target.value } )

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

        const { id, className, isVisible, submitHandler, closeHandler } = this.props

        const _id    = id || `tLoginDialog_${_instanceCounter}`
        const _style = {
            display:       (isVisible) ? 'flex' : 'none',
            alignItems:    'center',
            flexDirection: 'column'
        }
        const _class = ( className ) ? `tLoginDialog ${className}` : 'tLoginDialog'

        return (
            <form id={_id} className={_class} style={_style} onSubmit={submitHandler}>
                <THeader>
                    <TCentererLayout>
                        <span>Connection</span>
                    </TCentererLayout>
                </THeader>

                <TContent>
                    <vertical-layout style={{
                        display:       'flex',
                        flexDirection: 'column'
                    }}>
                        <i className={'fa fa-user-circle-o'}></i>

                        <label>Username</label>
                        <input type={'text'} placeholder={"Enter Username"} name={"userName"} required />

                        <label>Password</label>
                        <input type={"password"} placeholder={"Enter Password"} name={"password"} required />
                        <span className={"psw"}><a href={"#"}>Forgot password ?</a></span>
                    </vertical-layout>
                </TContent>

                <TFooter>
                    <div style={{
                        display: 'flex',
                        height:  '100%'
                    }}>
                        <button type={"button"} onClick={closeHandler} className={'cancel-btn btn-danger'}>Cancel</button>
                        <button type={"submit"} value={"Submit"}>Login</button>
                    </div>
                </TFooter>

            </form>
        )

        //        return (
        //            <t-login-dialog ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-login-dialog>
        //        )

    }

}

export { TLoginDialog }
