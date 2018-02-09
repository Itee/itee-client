/**
 * Created by tvalcke on 17/06/2015.
 */

    //todo singleton pattern or module ?
    ////////////////////////////////////////////////////// NODIX FACTORY ////////////////////////////////////////////////////

(function() {
    'use strict';

    // Pre-required
    if ( typeof NODIX === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX need to be define before NODIX.HtmlFactory, sorry for the disagreement...');
    }

    /**
     * This object allow to create all wanted html tag from an javascript object
     * @param options for init the static NODIX.HtmlFactory.options
     *
     *
     *
     * @constructor
     */
    NODIX.HtmlFactory = function( options ) {

        // todo INNER validate options !
        // use static options ! It can be access anywhere under HtmlFactory AND can be set on the fly with user options inputs
        if ( options ) {
            NODIX.HtmlFactory.options = NODIX.fn.extendObject(NODIX.HtmlFactory.options, options);
        }

        //todo: allow user to add descriptor
        // Generate all attributes class from descriptor
        NODIX.HtmlFactory.ATTRIBUTES.generateAttributesClass(NODIX.HtmlFactory.ATTRIBUTES.DESCRIPTOR);
        // Generate all tags class from descriptor
        NODIX.HtmlFactory.TAGS.generateTagsClass(NODIX.HtmlFactory.TAGS.DESCRIPTOR);

    };

    //Todo think about if we really want this as "static" for the Class HtmlFactory ?
    //Todo And how to set properly options who can hold by children if needed !
    //
    //Todo: Allow time of dev in function of % populate in each browser
    //Todo: Need to find a way to get permanently this data...
    //Todo: is it needed to call external api ?
    //Todo: ...or...
    //Todo: use post it every x time about required check for this data (dataRefreshTimeRate)
    NODIX.HtmlFactory.options = {
        useHtml5:         true,
        useBootstrap:     true,                                                 // todo: Add tag class for bootstrap css !
        supportedBrowser: [
            'chrome',
            'ie',
            'firefox',
            'safari',
            'opera'
        ],    // Use tags and tags attributes compatible for all browser !
        supportedDevice:  [ 'computer' ]
    };

    /**
     * HtmlFactory method for render a javascript tag structure to html
     * @param tagsStructure could be an single Tag object or an array of that.
     * @returns {string} HTML
     */
    NODIX.HtmlFactory.prototype.renderTags = function( tagsStructure ) {

        function renderTag( tagStructure ) {

            tagClassName = NODIX.fn.classNameify(tagStructure.tagName);
            tag          = new NODIX.HtmlFactory.TAGS[ tagClassName ](tagStructure.attributes, tagStructure.children);
            return NODIX.HtmlFactory.TAGS.getTagResult(tag);

        }

        var result = "";
        //todo: Test about speed of init using this technique or the other
        if ( NODIX.fn.isTagStructure(tagsStructure) ) {

            var tagStructure = null,
                tag          = null,
                tagClassName = null;

            for ( var index = 0, dsLength = tagsStructure.length ; index < dsLength ; index = index + 1 ) {

                //result += NODIX.HtmlFactory.TAGS.getTagResult( NODIX.HtmlFactory.createTag( _tagStructure[index] ) );
                //dev
                tagStructure = tagsStructure[ index ];

                tagClassName = NODIX.fn.classNameify(tagStructure.tagName);
                tag          = new NODIX.HtmlFactory.TAGS[ tagClassName ](tagStructure.attributes, tagStructure.children);
                result += NODIX.HtmlFactory.TAGS.getTagResult(tag);
            }

        } else if ( NODIX.fn.isArrayOfTagStructure(tagsStructure) ) {

            tagClassName = NODIX.fn.classNameify( tagsStructure.tagName );
            tag          = new NODIX.HtmlFactory.TAGS[ tagClassName ]( tagsStructure.attributes, tagsStructure.children );
            result += NODIX.HtmlFactory.TAGS.getTagResult( tag );

        } else {
            var errorMessage = "Invalid argument, can't create tag from null, undefined or empty json tab structure !" + "\n" +
                "Had expected a tag descriptor that look something like that : " + "\n" +
                "{\n" +
                "\ttagName: 'name',\n" +
                "\tattributes: {},\n" +
                "\tchildren: []\n" +
                "}\n" +
                " ...or... an array of that !";

            throw new Error(errorMessage);
        }

        return result;


    };

})();
