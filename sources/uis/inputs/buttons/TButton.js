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

class TButton extends React.Component {

    render () {
        const { label, icon, onClickHandler } = this.props

        if ( label && icon ) {

            return (
                <button
                    className="btn"
                    onClick={onClickHandler}>
                    <i className={icon}></i>
                    {label}
                </button>
            )

        } else if ( label && !icon ) {

            return (
                <button
                    className="btn"
                    onClick={onClickHandler}>
                    {label}
                </button>
            )

        } else if ( !label && icon ) {

            return (
                <button
                    className="btn"
                    onClick={onClickHandler}>
                    <i className={icon}></i>
                </button>
            )

        } else {

            return (
                <button
                    className="btn"
                    onClick={onClickHandler}>
                </button>
            )

        }
    }

}

export { TButton }
