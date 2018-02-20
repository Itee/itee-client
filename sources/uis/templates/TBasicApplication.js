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
import { THeader, TContent, TFooter } from '../displays/sections/_sections'
import { TAppBar, TToolBar, TStatusBar } from '../displays/bars/_bars'
import { TDateTime } from '../displays/bases/_bases'
import { TBrand, TMenu, TMenuItem, TDropDownMenu } from '../displays/navigations/_navigations'
import { TLogingButton, TButtonGroup, TToolButton } from '../inputs/buttons/_buttons'
import { TSplitter } from '../displays/splitters/_splitters'
import { TTree, TTreeItem } from '../displays/trees/_trees'
import { TViewport3D } from '../displays/medias/_medias'
import { TDialogArea, TLoginDialog } from '../interactives/dialogs/_dialogs'

class TBasicApplication extends React.Component {

    constructor ( props ) {

        super( props )

        this.state = {
            underDialog:     false,
            showLoginDialog: false,
            isLogged:        false
        }

        this.logInButtonHandler  = this.logInButtonHandler.bind( this )
        this.logOutButtonHandler = this.logOutButtonHandler.bind( this )
        this.loginCloseHandler   = this.loginCloseHandler.bind( this )
        this.loginSubmitHandler  = this.loginSubmitHandler.bind( this )

    }

    /**
     * Component lifecycle
     */



    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    componentWillReceiveProps ( /*nextProps*/ ) {}

    shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    /**
     * Component Handlers
     */

    logInButtonHandler () {

        if ( !this.state.isLogged ) {

            this.setState( {
                underDialog:     true,
                showLoginDialog: true
            } )

        }

    }

    logOutButtonHandler () {

        if ( this.state.isLogged ) {

            this.setState( prevState => ({
                isLogged: !prevState.isLogged
            }) )

        }

    }

    loginCloseHandler () {

        this.setState( {
            underDialog:     false,
            showLoginDialog: false
        } )

    }

    loginSubmitHandler ( event ) {

        //Todo: wait server response
        this.setState( prevState => ({
            isLogged:        !prevState.isLogged,
            underDialog:     false,
            showLoginDialog: false
        }) )

        event.preventDefault()

    }

    /**
     * Component Methods
     */

    /**
     * Component Rendering
     */

    render () {

        const { id, className } = this.props

        const _id    = id || `tBasicApplicationId`
        const _style = {
            display:  'flex',
            flexFlow: 'column',
            height:   '100%'
        }
        const _class = className || 'tBasicApplication'

        return (
            <t-basic-application id={_id} style={_style} class={_class}>
                <THeader>
                    <TAppBar
                        left={
                            <TBrand icon={'fa fa-rocket'} label={'Itee'} />
                        }

                        center={
                            <TMenu>
                                <TMenuItem id={'docsBtn'} label={'Docs'} tooltip={'Voir la documentation'} />
                                <TMenuItem id={'tutorialBtn'} label={'Tutorial'} tooltip={'Lancer le tutorial d\'utilisation'} />
                                <TMenuItem id={'viewerBtn'} label={'Visualiseur'} tooltip={'Voir les données'} />
                                <TMenuItem id={'uploadBtn'} label={'Téléverser'} tooltip={'Téléverser un fichier sur le serveur'} />
                                <TMenuItem id={'aboutBtn'} label={'A propos'} tooltip={'Voir les données'} />
                                <TDropDownMenu label={'MyDropdown'}>
                                    <a href={"#"}>Link 1</a>
                                    <a href={"#"}>Link 2</a>
                                    <a href={"#"}>Link 3</a>
                                </TDropDownMenu>
                            </TMenu>
                        }

                        right={
                            <div>
                                <TLogingButton isLogged={this.state.isLogged} round={true} logInHandler={this.logInButtonHandler} logOutHandler={this.logOutButtonHandler} />
                            </div>
                        }
                    />
                </THeader>
                <TContent>

                    <TToolBar>
                        <TButtonGroup>
                            <TToolButton id={'importBtn'} title={'Retourner à l\'acceuil'} icon={'fa fa-home'}></TToolButton>
                            <li className={'vDivider'} role={'separator'}></li>
                            <TToolButton id={'downloadBtn'} title={'Importer un fichier local'} icon={'fa fa-cloud-download'}></TToolButton>
                            <TToolButton id={'uploadBtn'} title={'Télécharger un fichier sur le serveur'} icon={'fa fa-cloud-upload'}></TToolButton>
                            <li className={'vDivider'} role={'separator'}></li>
                        </TButtonGroup>

                        {/*<ul className="nav navbar-nav">*/}
                        {/*<li>*/}
                        {/*<a class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="Outils de mesures">*/}
                        {/*<i class="fa fa-crosshairs" aria-hidden="true"></i>*/}
                        {/*</a>*/}
                        {/*<ul class="vertical-dropdown-black dropdown-menu" id="measureTools">*/}
                        {/*<li>*/}
                        {/*<a data-value="segment" aria-haspopup="true" aria-expanded="true" title="Distance entre un point A et un point B">*/}
                        {/*<i class="fa fa-expand"></i>*/}
                        {/*Segment*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a data-value="polyline" aria-haspopup="true" aria-expanded="true" title="Distances entre plusieurs points qui se suivent">*/}
                        {/*<i class="fa fa-share-alt"></i>*/}
                        {/*PolyLigne*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a data-value="polysegment" aria-haspopup="true" aria-expanded="true" title="Distances entre un point central et plusieurs points">*/}
                        {/*<i class="fa fa-arrows-alt"></i>*/}
                        {/*PolySegment*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="hDivider" role="separator"></li>*/}
                        {/*<li class="disabled">*/}
                        {/*<a data-value="disk" aria-haspopup="true" aria-expanded="true" title="Surface d'un disque">*/}
                        {/*<i class="fa fa-circle-o"></i>*/}
                        {/*Disque*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="disabled">*/}
                        {/*<a data-value="square" aria-haspopup="true" aria-expanded="true" title="Surface d'un rectangle">*/}
                        {/*<i class="fa fa-square-o"></i>*/}
                        {/*Carré*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="disabled">*/}
                        {/*<a data-value="polygone" aria-haspopup="true" aria-expanded="true" title="Surface d'un polygone">*/}
                        {/*<i class="fa fa-star-o"></i>*/}
                        {/*Polygone*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="hDivider" role="separator"></li>*/}
                        {/*<li class="disabled">*/}
                        {/*<a data-value="sphere" aria-haspopup="true" aria-expanded="true" title="Volume d'une sphère">*/}
                        {/*<i class="fa fa-dribbble"></i>*/}
                        {/*Sphère*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="disabled">*/}
                        {/*<a data-value="cube" aria-haspopup="true" aria-expanded="true" title="Volume d'un cube">*/}
                        {/*<i class="fa fa-codepen"></i>*/}
                        {/*Cube*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="hDivider" role="separator"></li>*/}
                        {/*<li>*/}
                        {/*<a class="danger" data-value="clear" aria-haspopup="true" aria-expanded="true" title="Effacer les mesures">*/}
                        {/*<i class="fa fa-window-close-o"></i>*/}
                        {/*Effacer*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*</ul>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="xRayBtn" data-toggle="button" title="Rayon X">*/}
                        {/*<i class="fa fa-wifi"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<TToolButton id="xRayBtn" title="Rayon X" icon={'fa fa-wifi'}></TToolButton>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="splitBtn" data-toggle="button" title="Outil de découpe">*/}
                        {/*<i class="fa fa-scissors"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="selectBtn" data-toggle="button" title="Sélection">*/}
                        {/*<i class="fa fa-hand-pointer-o"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li class="vDivider" role="separator"></li>*/}
                        {/*<li class="dropdown" role="presentation">*/}
                        {/*<a class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="Contrôle de camera">*/}
                        {/*<i class="fa fa-street-view"></i>*/}
                        {/*</a>*/}
                        {/*<ul class="vertical-dropdown-black dropdown-menu" id="cameraMode">*/}
                        {/*<li>*/}
                        {/*<a data-value="avatar">*/}
                        {/*<i class="fa fa-arrow-circle-right" aria-hidden="true"></i>*/}
                        {/*Avatar*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a data-value="orbital">*/}
                        {/*<i class="fa fa-globe" aria-hidden="true"></i>*/}
                        {/*Orbital*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*</ul>*/}
                        {/*</li>*/}
                        {/*<li class="dropdown" role="presentation">*/}
                        {/*<a class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="Effet de rendu 3D">*/}
                        {/*<i class="fa fa-eye"></i>*/}
                        {/*</a>*/}
                        {/*<ul class="vertical-dropdown-black dropdown-menu" id="renderEffectDropDown">*/}
                        {/*<li>*/}
                        {/*<a data-value="normal">*/}
                        {/*<i class="fa fa-eye"></i>*/}
                        {/*Normal*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a data-value="anaglyph">*/}
                        {/*<span class="glyphicon glyphicon-sunglasses" aria-hidden="true"></span>*/}
                        {/*Anaglyph*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a data-value="vr">*/}
                        {/*<i class="fa fa-cubes" aria-hidden="true"></i>*/}
                        {/*VR*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*</ul>*/}
                        {/*</li>*/}
                        {/*<li class="vDivider" role="separator"></li>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="detailBtn" title="Détails batiment">*/}
                        {/*<i class="fa fa-pencil"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="historyBtn" title="Historique d'intervention du batiment">*/}
                        {/*<i class="fa fa-history"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*<li>*/}
                        {/*<a class="btn" id="createBtn" title="Création d'intervention du batiment">*/}
                        {/*<i class="fa fa-flash"></i>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                        {/*</ul>*/}
                    </TToolBar>

                    <TSplitter initPosition={15}

                               first={
                                   <TTree>
                                       <TTreeItem id={'fooId'} name={'fooName'} />
                                       <TTreeItem id={'barId'} name={'barName'} />
                                       <TTreeItem id={'bazId'} name={'bazName'} />
                                   </TTree>
                               }

                               second={
                                   <TViewport3D />
                               } />

                </TContent>
                <TFooter height={40}>
                    <TStatusBar state={'fixed'} position={'bottom'}>
                        <TDateTime />
                    </TStatusBar>
                </TFooter>
                <TDialogArea isVisible={this.state.underDialog}>
                    <TLoginDialog isVisible={this.state.showLoginDialog} closeHandler={this.loginCloseHandler} submitHandler={this.loginSubmitHandler} />
                </TDialogArea>
            </t-basic-application>
        )

    }

}

export { TBasicApplication }

