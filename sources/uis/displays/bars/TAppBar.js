/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TAppBar
 * @classdesc This is the top application bar that contain 3 sub part, one left, one center and one right. The purpose of this bar container is to display an brand to left, the main menu to center
 *     and login button to the right.
 *
 * @example
 *
 * <TAppBar
 *      left={<TBrand />}
 *      center={<TMenu>...</TMenu>}
 *      right={<TLogingButton />}
 * />
 *
 */

/* eslint-env browser */

import React from 'react'

class TAppBar extends React.Component {

    render () {

        const { id, left, center, right } = this.props

        const _id = id || `tAppBarId`

        const _style = {
            display:        'flex',
            justifyContent: 'space-between'
        }

        const _subStyle = {
            display:      'flex',
            alignContent: 'center',
            alignItems:   'center'
        }

        return (
            <t-app-bar id={_id} style={_style} class={'tAppBar'}>
                <t-app-bar-left style={_subStyle} class={'tAppBarPart tAppBarLeft'}>
                    {left}
                </t-app-bar-left>
                <t-app-bar-center style={_subStyle} class={'tAppBarPart tAppBarLCenter'}>
                    {center}
                </t-app-bar-center>
                <t-app-bar-right style={_subStyle} class={'tAppBarPart tAppBarLRight'}>
                    {right}
                </t-app-bar-right>
            </t-app-bar>
        )

    }

}

export { TAppBar }
