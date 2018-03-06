/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDebugPanel
 * @classdesc Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

/* globals $ */

/**
 *
 * @param container
 * @param settings
 * @constructor
 */
function TDebugPanel ( container, settings ) {

    var _ = this;

    // First check if the given container exist, else throw an error
    if ( container === null || typeof container === 'undefined' || container.length === 0 ) { throw new Error( "Required an container or a template to be create !" ); }
    _.container = $( container );

    _.angle  = 0;
    _.radius = 5;

    _.defaultSettings = {
        posOnScreen: new Point2D( 0, 0 )
    };

    // Create the dashboard getting a jQuery object from static html template
    // that will contain widgets. Add event on view and link method.
    // Finally append it to the given container
    _.view        = $( TDebugPanel.getTemplate );
    _.debug_panel = _.view.find( '#container-debug' );

    _.options = $.extend( {}, _.defaultSettings, settings );

    _.init();
    _.initEvents();
}

Object.assign( TDebugPanel, {

    /**
     *
     * @return {string}
     */
    getTemplate () {
        return '' +
            '<div id="container-debug" class="flying-container" style="display: none;">' +
            '   <div class="row">' +
            '       <div class="col-md-12">' +
            '           <style scoped="true">' +
            '               table {' +
            '                   font-size: 14px;' +
            '                   margin: 10px;' +
            '               }' +
            '               table.debug tr th {' +
            '                   text-align: center;' +
            '                   padding: 5px;' +
            '                   border: 1px solid black;' +
            '               }' +
            '               table.debug tr td {' +
            '                   padding: 5px;' +
            '                   border: 1px solid black;' +
            '               }' +
            '           </style>' +
            '           <table class="debug">' +
            '               <thead>' +
            '                   <tr>' +
            '                       <th>$( document )</th>' +
            '                       <th>$( window )</th>' +
            '                       <th>$( navbar )</th>' +
            '                       <th>$("#main-container")</th>' +
            '                       <th>$("#inner-container")</th>' +
            '                   </tr>' +
            '               </thead>' +
            '               <tbody>' +
            '                   <tr>' +
            '                       <td>height * width</td>' +
            '                       <td><span id="document_height">0</span> * <span id="document_width">0</span></td>' +
            '                       <td><span id="window_height">0</span> * <span id="window_width">0</span></td>' +
            '                       <td><span id="navbar_height">0</span> * <span id="navbar_width">0</span></td>' +
            '                       <td><span id="mainContainer_height">0</span> * <span id="mainContainer_width">0</span></td>' +
            '                       <td><span id="innerContainer_height">0</span> * <span id="innerContainer_width">0</span></td>' +
            '                   </tr>' +
            '                   <tr>' +
            '                       <td>innerHeight * innerWidth</td>' +
            '                       <td><span id="document_innerHeight">0</span> * <span id="document_innerWidth">0</span></td>' +
            '                       <td><span id="window_innerHeight">0</span> * <span id="window_innerWidth">0</span></td>' +
            '                       <td><span id="navbar_innerHeight">0</span> * <span id="navbar_innerWidth">0</span></td>' +
            '                       <td><span id="mainContainer_innerHeight">0</span> * <span id="mainContainer_innerWidth">0</span></td>' +
            '                       <td><span id="innerContainer_innerHeight">0</span> * <span id="innerContainer_innerWidth">0</span></td>' +
            '                   </tr>' +
            '                   <tr>' +
            '                       <td>outerHeight * outerWidth</td>' +
            '                       <td><span id="document_outerHeight">0</span> * <span id="document_outerWidth">0</span></td>' +
            '                       <td><span id="window_outerHeight">0</span> * <span id="window_outerWidth">0</span></td>' +
            '                       <td><span id="navbar_outerHeight">0</span> * <span id="navbar_outerWidth">0</span></td>' +
            '                       <td><span id="mainContainer_outerHeight">0</span> * <span id="mainContainer_outerWidth">0</span></td>' +
            '                       <td><span id="innerContainer_outerHeight">0</span> * <span id="innerContainer_outerWidth">0</span></td>' +
            '                   </tr>' +
            '               </tbody>' +
            '           </table>' +
            '       </div>' +
            '   </div>' +
            '</div>'

    }

} )

Object.assign( TDebugPanel.prototype, {

    /**
     *
     */
    init () {
        var navbarFixedTop_outerHeight    = $( ".navbar-fixed-top" ).outerHeight( true );
        var breadcrumb_outerHeight        = $( ".sub-navbar-fixed-top" ).outerHeight( true );
        var navbarTopTotalHeight          = navbarFixedTop_outerHeight + breadcrumb_outerHeight;
        // So...
        var navbarFixedBottom_outerHeight = $( ".navbar-fixed-bottom" ).outerHeight( true );

        // On obtient la totalité de l'écran couvert
        var navbarTotalHeight = navbarTopTotalHeight + navbarFixedBottom_outerHeight;
    },

    /**
     *
     */
    initEvents () {
        var _ = this;
        $( window ).resize( function () {
            _.updateDebugSize( $( this ) );
        } );
    },

    /**
     *
     * @param document
     */
    updateDocumentSize ( document ) {
        $( "#document_width" ).html( document.width() );
        $( "#document_height" ).html( document.height() );
        $( "#document_innerHeight" ).html( document.innerHeight() );
        $( "#document_innerWidth" ).html( document.innerWidth() );
        $( "#document_outerHeight" ).html( document.outerHeight() );
        $( "#document_outerWidth" ).html( document.outerWidth() );
    },

    /**
     *
     * @param _window
     */
    updateWindowSize ( _window ) {
        $( "#window_width" ).html( _window.width() );
        $( "#window_height" ).html( _window.height() );
        $( "#window_innerHeight" ).html( _window.innerHeight() );
        $( "#window_innerWidth" ).html( _window.innerWidth() );
        $( "#window_outerHeight" ).html( _window.outerHeight() );
        $( "#window_outerWidth" ).html( _window.outerWidth() );
    },

    /**
     *
     * @param navbar
     */
    updateNavbarSize ( navbar ) {
        $( "#navbar_width" ).html( navbar.width() );
        $( "#navbar_height" ).html( navbar.height() );
        $( "#navbar_innerHeight" ).html( navbar.innerHeight() );
        $( "#navbar_innerWidth" ).html( navbar.innerWidth() );
        $( "#navbar_outerHeight" ).html( navbar.outerHeight() );
        $( "#navbar_outerWidth" ).html( navbar.outerWidth() );
    },

    /**
     *
     * @param mainContainer
     */
    updateMainContainerSize ( mainContainer ) {
        $( "#mainContainer_width" ).html( mainContainer.width() );
        $( "#mainContainer_height" ).html( mainContainer.height() );
        $( "#mainContainer_innerHeight" ).html( mainContainer.innerHeight() );
        $( "#mainContainer_innerWidth" ).html( mainContainer.innerWidth() );
        $( "#mainContainer_outerHeight" ).html( mainContainer.outerHeight() );
        $( "#mainContainer_outerWidth" ).html( mainContainer.outerWidth() );
    },

    /**
     *
     * @param innerContainer
     */
    updateInnerContainerSize ( innerContainer ) {
        $( "#innerContainer_width" ).html( innerContainer.width() );
        $( "#innerContainer_height" ).html( innerContainer.height() );
        $( "#innerContainer_innerHeight" ).html( innerContainer.innerHeight() );
        $( "#innerContainer_innerWidth" ).html( innerContainer.innerWidth() );
        $( "#innerContainer_outerHeight" ).html( innerContainer.outerHeight() );
        $( "#innerContainer_outerWidth" ).html( innerContainer.outerWidth() );
    },

    /**
     *
     * @param _document
     */
    updateDebugSize ( _document ) {

        var _ = this;
        //Document
        _.updateDocumentSize( _document );

        //Windows
        var _window = $( this );
        _.updateWindowSize( _window );

        //Navbar
        var _navbar = $( "#navbar-top" );
        _.updateNavbarSize( _navbar );

        //mainContainer
        var _mainContainer = $( "#main-container" );
        _.updateMainContainerSize( _mainContainer );

        //innerContainer
        var _innerContainer = $( "#inner-container" );
        _.updateInnerContainerSize( _innerContainer );

    }

} )

export { TDebugPanel }
