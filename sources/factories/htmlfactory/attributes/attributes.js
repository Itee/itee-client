/**
 * Created by tvalcke on 17/06/2015.
 */

(function() {
    'use strict';

    // Pre-required
    if ( typeof NODIX.HtmlFactory === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.HtmlFactory.TAGS need to be define before NODIX.HtmlFactory.TAGS.ATTRIBUTES, sorry for the disagreement...');
    }

    NODIX.HtmlFactory.ATTRIBUTES = NODIX.HtmlFactory.ATTRIBUTES || {};

    NODIX.HtmlFactory.ATTRIBUTES.DESCRIPTOR = [
        {
            name:                            'id',
            //browserSupported: [''], // = all = default !
            creationRule:                    function() {
                return true;
            },
            errorMessage:                    null, //useless because creationRule true
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for id, expected a string !" //todo: or array of string or string with spaces

        },
        {
            name:                            'class',
            browserSupported:                [ '' ],
            creationRule:                    function() {
                return true;
            },
            errorMessage:                    null, //useless because creationRule true
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for class, expected a string !" //todo: or array of string or string with spaces

        },
        {
            name:                            'href',
            browserSupported:                [ '' ],
            creationRule:                    function() {
                return true;
            },
            errorMessage:                    null, //useless because creationRule true
            //valueIsOptional: false, //useless because default is false
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for href, expected a string !"

        },
        {
            name:                            'hreflang',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a hreflang attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ '' ],
            valueValidationRule:             function( newValue ) {
                return (NODIX.fn.isNotEmptyString(newValue) && newValue.length === 2);
            },
            valueValidationRuleErrorMessage: "Invalid argument for hreflang, expected a two-letter language code that specifies the language of the linked document !"
        },
        {
            name:                            'target',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a target attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ '' ],
            valueValidationRule:             function( newValue ) {
                var availableValues = [
                    '_blank',
                    '_self',
                    '_parent',
                    '_top'
                ];
                return (NODIX.fn.isNotEmptyString(newValue) && availableValues.indexOf(newValue) >= 0);
            },
            valueValidationRuleErrorMessage: "Invalid argument for target, expected a string about the target where open document after click on !"
        },
        {
            name:                            'rel',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a rel attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ '' ],
            valueValidationRule:             function( newValue ) {
                var availableValues = [
                    'alternate',
                    'author',
                    'bookmark',
                    'help',
                    'license',
                    'next',
                    'nofollow',
                    'noreferrer',
                    'prefetch',
                    'prev',
                    'search',
                    'tag'
                ];
                return (NODIX.fn.isNotEmptyString(newValue) && availableValues.indexOf(newValue) >= 0);
            },
            valueValidationRuleErrorMessage: "Invalid argument for rel, expected a string about the relation between current web page and linked document !"
        },
        {
            name:                            'type',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a type attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ '' ],
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for type, expected a string about the Internet media type of the linked document !"
        },

        {
            name:                            'media',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a media attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ '' ],
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for media, expected a string about what media/device the linked document is optimized for !"
        },
        {
            name:                            'download',
            creationRule:                    function() {
                return this.href !== null;
            },
            errorMessage:                    "You can't set a download attribute on <a> tag without specified an href attribute !",
            unsupportedBrowser:              [ 'safari' ],
            valueIsOptional:                 true,
            valueValidationRule:             function( newValue ) {
                return NODIX.fn.isNotEmptyString(newValue);
            },
            valueValidationRuleErrorMessage: "Invalid argument for download, expected a string, or empty string !"
        }
    ];

    NODIX.HtmlFactory.ATTRIBUTES.getDescriptor = function( descriptorName ) {

        for ( var i = 0, len = NODIX.HtmlFactory.ATTRIBUTES.DESCRIPTOR.length ; i < len ; i++ ) {

            var descriptor = NODIX.HtmlFactory.ATTRIBUTES.DESCRIPTOR[ i ];
            if ( descriptor.name === descriptorName ) {
                return descriptor;
            }

        }
        return null;

    };

    NODIX.HtmlFactory.ATTRIBUTES.getTemplateAttributeClassForDescriptor = function( attributeDescriptor ) {

        //Validate input
        if ( NODIX.fn.isEmpty(attributeDescriptor.name) ) { throw new Error("Invalid name, can't be null or undefined, expected a function for validate setter input.") }
        ;
        if ( NODIX.fn.isEmpty(attributeDescriptor.valueValidationRule) ) { throw new Error("Invalid validationRule, can't be null or undefined, expected a function for validate setter input.") }
        ;
        if ( NODIX.fn.isEmpty(attributeDescriptor.valueValidationRuleErrorMessage) ) { throw new Error("Invalid errorMessage, can't be null or undefined, expected a valid errorMessage of string type.") }
        ;

        var attribute = attributeDescriptor;

        return function( value ) {

            //Common properties tags
            var _name                            = null,
                _browserSupported                = attribute.supportedBrowser || [ '' ],
                //Required properties in descriptor
                _valueIsOptional                 = null,
                _valueValidationRule             = attribute.valueValidationRule || function() {
                        return true;
                    },
                _valueValidationRuleErrorMessage = attribute.valueValidationRuleErrorMessage || "Empty error message in " + name,
                //Optional given properties
                _value                           = null;

            Object.defineProperty(this, "value", {
                get: function() {
                    return _value;
                },
                set: function( newValue ) {

                    if ( !_valueIsOptional && NODIX.fn.isEmpty(newValue) ) {
                        throw new Error("Invalid given value" + newValue + " for " + _name + ", can't be null, undefined or empty, expected a valid option value. For default just provide empty object about value type.");
                    }

                    if ( _valueValidationRule(newValue) ) {
                        _value = newValue;
                    } else {
                        throw new Error(_valueValidationRuleErrorMessage);
                    }
                }
            });

            //Required properties
            this._value = value;

            Object.defineProperty(this, "name", {
                get: function() {
                    return _name;
                },
                set: function( name ) {

                    if ( NODIX.fn.isNotEmptyString(name) ) {
                        _name = name;
                    } else {
                        throw new Error("Invalid given name " + name + ", can't be null, undefined or empty, expected a string.");
                    }
                }
            });

            //It will set the name of attribute on instantiation with attribute descriptor initial value
            this._name = attribute.name;

            Object.defineProperty(this, "valueIsOptional", {
                get: function() {
                    return _valueIsOptional;
                },
                set: function( valueIsOptional ) {

                    if ( valueIsOptional instanceof Boolean ) {
                        _valueIsOptional = valueIsOptional;
                    } else {
                        throw new Error("Invalid given valueIsOptional " + valueIsOptional + ", can't be null, undefined or empty, expected a boolean.");
                    }
                }
            });

            this._valueIsOptional = attribute.valueIsOptional || false;

        };

    };

    /***** ES CE QUE CEST VRAIMENT UTILES ?? ***/
    /**
     * It will create all tag attribute objects with appropriate template, looping over local descriptor attributesList.
     * @type {tag attribute descriptor}
     * @return attribute object in function of inputs params
     */
    NODIX.HtmlFactory.ATTRIBUTES.generateAttributesClass = function( descriptorAttributesList ) {

        if ( NODIX.fn.isEmptyArray(descriptorAttributesList) ) { throw new Error("Invalid attributesList, can't be null or undefined, expected an array !") }

        var descriptorAttribute = null,
            className           = null;

        for ( var index = 0, listLength = descriptorAttributesList.length ; index < listLength ; index = index + 1 ) {

            descriptorAttribute = descriptorAttributesList[ index ];
            className           = NODIX.fn.classNameify(descriptorAttribute.name);

            if ( NODIX.fn.isNotEmpty(NODIX.HtmlFactory.ATTRIBUTES[ className ]) ) {
                return false;
                //throw new Error("NODIX.HtmlFactory.ATTRIBUTES."+className+" still exist ! Don't recreate it ! If you want to be able to override it please contact us...");
            }

            NODIX.HtmlFactory.ATTRIBUTES[ className ] = NODIX.HtmlFactory.ATTRIBUTES.getTemplateAttributeClassForDescriptor(descriptorAttribute);

        }

    };

})();


