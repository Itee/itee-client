/**
 * Created by tvalcke on 17/06/2015.
 */

    ////////////////////////////////////////////////////// NODIX FACTORY TAGS NAMESPACE ///////////////////////////////////////////////////////////
(function() {
    'use strict';

    // Pre-required
    if ( typeof NODIX.HtmlFactory === 'undefined' ) {
        throw new Error('NODIX.HtmlFactory need to be define before NODIX.HtmlFactory.TAGS, sorry for the disagreement...');
    }

    NODIX.HtmlFactory.TAGS = NODIX.HtmlFactory.TAGS || {};

    NODIX.HtmlFactory.TAGS.CLOSING_TYPE = {
        selfClosing:        "selfClosing",
        selfClosingSlashed: "selfClosingSlashed",
        closingTag:         "closingTag"
    };

    NODIX.HtmlFactory.TAGS.DESCRIPTOR = [
        {
            name:             'body',
            browserSupported: [ '' ],
            creationRule:     function() {
                return true; // can be inside other a tag or button
            },
            errorMessage:     null, //useless because creationRule true
            closingType:      NODIX.HtmlFactory.TAGS.CLOSING_TYPE.closingTag //useless because default is false
            //valueValidationRule: function(newValue){
            //    return NODIX.fn.isNotEmptyString(newValue);
            //},
            //valueValidationRuleErrorMessage: "Invalid argument for href, expected a string !"

        }
        ,
        {
            name:             'a',
            browserSupported: [ '' ],
            creationRule:     function() {
                return true; // can be inside other a tag or button
            },
            errorMessage:     null, //useless because creationRule true
            closingType:      NODIX.HtmlFactory.TAGS.CLOSING_TYPE.closingTag //useless because default is false
            //valueValidationRule: function(newValue){
            //    return NODIX.fn.isNotEmptyString(newValue);
            //},
            //valueValidationRuleErrorMessage: "Invalid argument for href, expected a string !"

        }
    ];

    NODIX.HtmlFactory.TAGS.getTemplateTagClassForDescriptor = function( descriptorTag ) {

        //Required property for create a tag from initialization descriptor
        if ( NODIX.fn.isEmpty(descriptorTag.name) ) { throw new Error("Invalid name, can't be null or undefined, expected a function for validate setter input.") }
        ;
        if ( !(descriptorTag.closingType in NODIX.HtmlFactory.TAGS.CLOSING_TYPE) ) { throw new Error("Invalid closingType, can't be null or undefined, expected a function for validate setter input.") }
        ;


        return function( attributesList, children ) {

            //Required properties in descriptor
            /**
             * Here we could create the new attributes with NODIX.HtmlFactory.ATTRIBUTES.generateAttributesClass(newAttributesDescriptor); but...
             * i prefère set them into attributes descriptor !
             * @type {*|string}
             * @private
             */
            var _name             = descriptorTag.name,
                _closingType      = descriptorTag.closingType, //could use a default to lighter descriptor
                //Optional properties in descriptor
                _browserSupported = descriptorTag.supportedBrowser || [ '' ],
                //Optional given properties
                _attributesList   = NODIX.HtmlFactory.TAGS.createOptionalAttributes(attributesList), //todo set as array
                _children         = NODIX.HtmlFactory.TAGS.createTag(children) || [];

            Object.defineProperties(this, {
                _name:           {
                    enumerable: true,
                    get:        function() {
                        return _name;
                    },
                    set:        function( name ) {
                        if ( NODIX.fn.isNotEmptyString(name) ) {
                            _name = name;
                        } else {
                            throw new Error("Invalid argument, expected a string.");
                        }
                    }
                },
                _closingType:    {
                    enumerable: true,
                    get:        function() {
                        return _closingType;
                    },
                    set:        function( newClosingType ) {
                        if ( newClosingType in NODIX.HtmlFactory.TAGS.CLOSING_TYPE ) {
                            _closingType = newClosingType;
                        } else {
                            throw new Error("Invalid argument, expected a NODIX.HtmlFactory.TAGS.CLOSING_TYPE.");
                        }
                    }
                },
                _attributesList: {
                    enumerable: true,
                    get:        function() {
                        return _attributesList;
                    },
                    set:        function( newAttribute ) {
                        if ( true ) {
                            //if (NODIX.fn.isNotEmptyString(newChild)) {
                            _attributesList.push(newAttribute);
                        } else {
                            throw new Error("Invalid argument, expected a NODIX.HtmlFactory.TAGS.XXX");
                        }
                    }
                },
                _children:       {
                    enumerable: true,
                    get:        function() {
                        return _children;
                    },
                    set:        function( newChild ) {
                        if ( true ) {
                            //if (NODIX.fn.isNotEmptyString(newChild)) {
                            _children.push(newChild);
                        } else {
                            throw new Error("Invalid argument, expected a NODIX.HtmlFactory.TAGS.CLOSING_TYPE.");
                        }
                    }
                }
            });

            //NODIX.HtmlFactory.TAGS.createRequiredAttributes(this, attributesList);

        };

    };

    /**
     * Will create all tags class from given tags descriptors array
     * @param descriptorTagList
     */
    NODIX.HtmlFactory.TAGS.generateTagsClass = function( descriptorTagList ) {

        var descriptorTag = null,
            className     = null;

        if ( NODIX.fn.isArrayOfNotEmptyObject(descriptorTagList) ) {

            for ( var index = 0, listLength = descriptorTagList.length ; index < listLength ; index = index + 1 ) {

                //todo validate params in attribute before to set them !!!
                descriptorTag = descriptorTagList[ index ];
                className     = NODIX.fn.classNameify(descriptorTag.name);

                if ( NODIX.fn.isNotEmpty(NODIX.HtmlFactory.TAGS[ className ]) ) { continue; } //throw new Error("NODIX.HtmlFactory.TAGS."+className+" still exist ! Don't recreate it ! If you want to be able to override it please contact us...");

                NODIX.HtmlFactory.TAGS[ className ] = NODIX.HtmlFactory.TAGS.getTemplateTagClassForDescriptor(descriptorTag);

            }

        } else if ( NODIX.fn.isNotEmptyObject(descriptorTagList) ) {

            className = NODIX.fn.classNameify(descriptorTag.name);

            if ( NODIX.fn.isEmpty(NODIX.HtmlFactory.TAGS[ className ]) ) {
                NODIX.HtmlFactory.TAGS[ className ] = NODIX.HtmlFactory.TAGS.getTemplateTagClassForDescriptor(descriptorTag);
            }
            //else throw new Error("NODIX.HtmlFactory.TAGS."+className+" still exist ! Don't recreate it ! If you want to be able to override it please contact us...");

        } else {
            throw new Error("Invalid descriptorTagList, can't be null or undefined, expected an array of tag descriptor or a single tag descriptor object!")
        }


    };

    /**
     * Created all new required attributes who need to be initialized by user's given options or default values,
     * and affect them to current instance by setter defined previously.
     * @param {string[]} - a list of the optionals <a> attributes
     */
    NODIX.HtmlFactory.TAGS.createRequiredAttributes = function( tag, options ) {
        //className = attribute.charAt(0).toUpperCase() + attribute.slice(1);
        //this[attribute] = (options[attribute] ? new NODIX.HtmlFactory.TAGS.A.ATTRIBUTES[className](options[attribute]) : new NODIX.HtmlFactory.TAGS.A.ATTRIBUTES[className]() );
    };

    /**
     * Created all new optional attributes who need to be initialized by user's given options,
     * and affect them to current instance by setter defined previously.
     *
     // SHORTEN VERSION IT WON'T ALLOW cretionRule BUT...
     // IF ALL ATTRIBUTES DO NOT REQUIRED ANY CREATION RULE THEN...
     // IT WILL BE FASTER !!!
     //var attributesList = ['href', 'download', 'hreflang', 'media', 'rel', 'target', 'type'];
     //for(var index = 0, listLength = attributesList.length; index < listLength ; index = index + 1){
    //    var attribute = attributesList[index];
    //    if(attribute in options){
    //        var className = attribute.charAt(0).toUpperCase() + attribute.slice(1);
    //        this[attribute] = new NODIX.HtmlFactory.TAGS.A.ATTRIBUTES[className](options[attribute]);
    //    }
    //}
     * @param {string[]} - a list of the optionals <a> attributes
     */
    NODIX.HtmlFactory.TAGS.createOptionalAttributes = function( attributesList ) {

        var className       = '',
            classDescriptor = {};

        // Iterate over all user's given options
        var resultArray = [];
        for ( var attribute in attributesList ) {
            if ( attributesList.hasOwnProperty(attribute) ) {

                // Try to find the attribute descriptor for current property
                classDescriptor = NODIX.HtmlFactory.ATTRIBUTES.getDescriptor(attribute);
                if ( NODIX.fn.isEmpty(classDescriptor) ) {
                    throw new Error("Unable to find class descriptor for attribute name: " + attribute);
                }

                // If we can create this attribute
                if ( !classDescriptor.creationRule() ) {
                    throw new Error(classDescriptor.errorMessage);
                }

                //Create the ClassNamed
                className = NODIX.fn.classNameify(attribute);
                if ( NODIX.fn.isEmpty(NODIX.HtmlFactory.ATTRIBUTES[ className ]) ) {
                    throw new Error("NODIX.HtmlFactory.ATTRIBUTES." + className + " is empty, the class was not created before trying to use it !");
                }

                resultArray.push(new NODIX.HtmlFactory.ATTRIBUTES[ className ](attributesList[ attribute ]));

            }
        }
        return resultArray;

    };

    NODIX.HtmlFactory.TAGS.createTag = function( childList ) {

        if ( NODIX.fn.isNotArray(childList) ) { throw new Error("Invalid argument, can't be null or undefined, expected a array.") }

        var instanceChildArray = [];
        for ( var childIndex = 0, childListLength = childList.length ; childIndex < childListLength ; childIndex++ ) {
            var currentChild = childList[ childIndex ];

            if ( NODIX.fn.isNotEmptyString(currentChild) ) {
                instanceChildArray.push(currentChild);
            } else {

                var tagClassName = NODIX.fn.classNameify(currentChild.tagName);
                instanceChildArray.push(new NODIX.HtmlFactory.TAGS[ tagClassName ](currentChild.attributes, currentChild.children));

            }

        }
        return instanceChildArray;

    };

    NODIX.HtmlFactory.TAGS.getArrayTagResult = function( tagArray ) {
        var result = "";
        for ( var index = 0, tagNumber = tagArray.length ; index < tagNumber ; index = index + 1 ) {
            result += NODIX.HtmlFactory.TAGS.getTagResult(tagArray[ index ]);
        }
        return result;
    };

    NODIX.HtmlFactory.TAGS.getTagResult = function( tag ) {

        var result = "";

        if ( NODIX.fn.isEmptyObject(tag) ) { throw new Error("Invalid argument tag: " + tag + ", expected a tag object !"); }
        if ( NODIX.fn.isEmptyString(tag._name) ) { throw new Error("Invalid tag name: " + tag._name + ", can't be null, empty or undefined !"); }

        if ( NODIX.fn.isNotEmptyString(tag) ) {

            result += tag;

        } else if ( NODIX.fn.isNotEmptyArray(tag) ) {

            result += NODIX.HtmlFactory.TAGS.getArrayTagResult(tag);

        } else if ( NODIX.fn.isNotEmptyObject(tag) ) {


            var tagName       = tag._name,
                tagAttributes = tag._attributesList;

            result += "<" + tagName;

            if ( NODIX.fn.isNotEmptyArray(tagAttributes) ) {
                result += NODIX.HtmlFactory.TAGS.getAttributesResult(tagAttributes);
            }

            switch ( tag._closingType ) {
                case "selfClosing":
                    result += ">";
                    break;

                case "selfClosingSlashed":
                    result += "/>";
                    break;

                case "closingTag":
                    result += ">";
                    result += NODIX.HtmlFactory.TAGS.getTagResult(tag._children);
                    result += "</" + tagName + ">";
                    break;

                default:
                    throw new Error("Invalid closing type for tag <" + tagName + ">");
            }

        } else {
            throw new Error("Can't get result of child tag, unknown type of child, expected string, array of strings or tag object !")
        }

        return result;

    };

    NODIX.HtmlFactory.TAGS.getAttributesResult = function( tagAttributesList ) {

        if ( NODIX.fn.isNotArray(tagAttributesList) ) { // it could be a single tag attribute
            if ( NODIX.fn.isEmptyObject(tagAttributesList) ) { throw new Error("Invalid argument tag attribute list, can't be an empty object, expected a tag attributes object or array of it !") }
        } else {
            if ( NODIX.fn.isArrayOfEmptyObject(tagAttributesList) ) { throw new Error("Invalid argument tag attribute list, can't be an array of invalid object, expected a tag attributes object or array of it !"); }
        }

        var result    = "",
            attribute = null;

        for ( var index = 0, listLength = tagAttributesList.length ; index < listLength ; index = index + 1 ) {

            attribute = tagAttributesList[ index ];
            if ( NODIX.fn.isEmptyObject(attribute) ) { throw new Error("Can't get tag attribute object: " + attribute + " expected an attribute object, but get undefined !") }

            if ( NODIX.fn.isNotEmpty(attribute._value) ) {
                result += " " + attribute._name + "='" + attribute._value + "'";
            } else if ( attribute._valueIsOptional ) {
                result += " " + attribute._name;
            } else {
                throw new Error("Can't create tag attribute: " + attribute._name + " expected an attribute value, but get undefined !")
            }

        }
        return result;

    };

})();
