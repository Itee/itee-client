/* eslint-env browser */

/**
 * Created by Tristan on 20/08/2015.
 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function( $ ) {
    'use strict';

    // Pre-required
    if ( typeof NODIX.ui === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.ThreeDSvgBox, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    _ui.ThreeDSvgBox = _ui.ThreeDSvgBox || (function() {

            function ThreeDSvgBox( container ) {

                var _ = this;

                _.firstRun         = true;
                _.timer            = null;
                _.tickRate         = 30;
                _.container        = $(container);
                _.cachedLinesArray = [];
                _.cachedRectsArray = [];
                _.trigoCircle      = new TrigoCircle();

                _.init();
            }

            return ThreeDSvgBox;

        }());

    _ui.ThreeDSvgBox.prototype.init = function() {

        var _ = this;

        //_.addSVGRect('5%', '5%', '90%', '90%');
        //_.addSVGRect('10%', '10%', '80%', '80%');
        //_.addSVGRect('15%', '15%', '70%', '70%');
        //_.addSVGRect('20%', '20%', '60%', '60%');
        _.addSVGRect('25%', '25%', '50%', '50%');

        _.addSVGLine('0%', '0%', '25%', '25%');
        _.addSVGLine('100%', '0%', '75%', '25%');
        _.addSVGLine('0%', '100%', '25%', '75%');
        _.addSVGLine('100%', '100%', '75%', '75%');

        _.firstRun = false;
    };

    _ui.ThreeDSvgBox.prototype.getContainerSizes = function() {

        var _ = this;
        return {
            height: $(_.container).height(),
            width:  $(_.container).width()
        };

    };

    _ui.ThreeDSvgBox.prototype.makeSVGElement = function( tagName, attributes ) {

        var element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        for ( var key in attributes ) {
            element.setAttribute(key, attributes[ key ]);
        }
        return element;

    };

    _ui.ThreeDSvgBox.prototype.addSVGLine = function( x1, y1, x2, y2 ) {

        var _       = this,
            viewId  = 'line' + _.cachedLinesArray.length.toString(),
            newLine = _.makeSVGElement('line', {
                id:             viewId,
                x1:             x1,
                y1:             y1,
                x2:             x2,
                y2:             y2,
                stroke:         'black',
                'stroke-width': 2
            });

        // We just need to cache once time at first init of this object
        if ( _.firstRun ) {

            // TODO SET THIS AS OPTIONS ? DEFAULT ? Quel est le mieux conceptuellement ???
            //_.cachedLinesArray = [ viewId, x1, y2, x2, y2 ];
            //
            //_.cachedLinesArray.push(
            //    {
            //        id: viewId,
            //        p1: { x1: x1, y1: y1 },
            //        p2: { x2: x2, y2: y2 }
            //        //etc...
            //    }
            //);

            //_.cachedLinesArray.push(
            //    {
            //        id: viewId,
            //        listPoints: [
            //            { x1: x1, y1: y1 },
            //            { x2: x2, y2: y2 }
            //        ] //etc...
            //    }
            //);

            //_.cachedLinesArray.push({
            //    id: viewId,
            //    listPoints: {
            //        p1: { x1: x1, y1: y1 },
            //        p2: { x2: x2, y2: y2 }
            //        //etc...
            //    }
            //});

            // or with object function ?

            _.cachedLinesArray.push(
                new Line(
                    viewId,
                    new Point2D(x1, y1),
                    new Point2D(x2, y2)
                    //etc...
                )
            );

            //_.cachedLinesArray.push(
            //    new Line(
            //        viewId,
            //        [
            //            new Point2D(x1, y1),
            //            new Point2D(x2, y2)
            //        ] //etc...
            //    )
            //);
        }

        _.container.append(newLine);

    };

    _ui.ThreeDSvgBox.prototype.addSVGRect = function( x, y, width, height ) {

        var _       = this,
            viewId  = 'rect' + _.cachedRectsArray.length.toString(),
            newRect = _.makeSVGElement('rect', {
                id:             viewId,
                x:              x,
                y:              y,
                width:          width,
                height:         height,
                stroke:         'black',
                'stroke-width': 2,
                fill:           'rgb(128, 128, 128)'
            });
        //newRect = _.makeSVGElement('rect', {id: viewId, x : x, y : y, width: width, height: height, stroke: 'black', 'stroke-width': 2, fill: 'rgb(80,80,80)'});

        if ( _.firstRun ) {
            _.cachedRectsArray.push(
                new Rect(
                    viewId,
                    new Point2D(x, y),
                    width,
                    height
                )
            );
        }

        _.container.append(newRect);

    };

    _ui.ThreeDSvgBox.prototype.getPercentBaseOnPixelValue = function( base_size, pixel_value ) {
        var _ = this;
        return _.convertIntToPercentString(pixel_value / (base_size / 100));
    };

    _ui.ThreeDSvgBox.prototype.getPixelValueBasedOnPercent = function( base_size, percent ) {
        var _ = this;
        return (base_size / 100) * _.convertPercentStringToInt(percent);
    };

    _ui.ThreeDSvgBox.prototype.convertIntToPercentString = function( int_value ) {
        var _ = this;
        return int_value.toString() + '%';
    };

    _ui.ThreeDSvgBox.prototype.convertPercentStringToInt = function( percent ) {
        return parseInt(percent.replace('%', ''), 10);
    };

    _ui.ThreeDSvgBox.prototype.start = function() {

        var _ = this;
        console.log("Start 3dBox");
        _.timer = setInterval(function() {
            _.update()
        }, _.tickRate);

    };

    _ui.ThreeDSvgBox.prototype.stop = function() {

        var _ = this;
        console.log("Stop 3dBox");
        clearTimeout(_.timer);

    };

    _ui.ThreeDSvgBox.prototype.update = function() {

        var _ = this;

        var baseSize = _.getContainerSizes(),
            radius   = _.trigoCircle.getRadius(),
            xOffset  = _.trigoCircle.getCosinus() * radius,
            yOffset  = _.trigoCircle.getSinus() * radius;

        // Update Lines
        _.updateLines(baseSize, xOffset, yOffset);

        // Update rect
        _.updateRects(baseSize, xOffset, yOffset);

        _.trigoCircle.increment();

    };

    _ui.ThreeDSvgBox.prototype.updateLines = function( baseSize, xOffset, yOffset ) {

        var _               = this,
            cachedLine      = null,
            currentLineView = null;

        for ( var i = 0, numLines = _.cachedLinesArray.length ; i < numLines ; i++ ) {
            cachedLine      = _.cachedLinesArray[ i ];
            currentLineView = $('#' + cachedLine.viewId);

            // Update view
            currentLineView.attr({
                "x2": _.getPercentBaseOnPixelValue(baseSize.width, _.getPixelValueBasedOnPercent(baseSize.width, cachedLine.p2.x) + xOffset),
                "y2": _.getPercentBaseOnPixelValue(baseSize.height, _.getPixelValueBasedOnPercent(baseSize.height, cachedLine.p2.y) + yOffset)
            });
        }

    };

    _ui.ThreeDSvgBox.prototype.updateRects = function( baseSize, xOffset, yOffset ) {

        var _               = this,
            cachedRect      = null,
            currentRectView = null;

        for ( var j = 0, numRects = _.cachedRectsArray.length ; j < numRects ; j++ ) {
            cachedRect      = _.cachedRectsArray[ j ];
            currentRectView = $('#' + cachedRect.viewId);

            // Update view
            currentRectView.attr({
                "x": _.getPercentBaseOnPixelValue(baseSize.width, _.getPixelValueBasedOnPercent(baseSize.width, cachedRect.position.x) + xOffset),
                "y": _.getPercentBaseOnPixelValue(baseSize.height, _.getPixelValueBasedOnPercent(baseSize.height, cachedRect.position.y) + yOffset)
            });
        }

    };

    /*	Si resize => MAJ width & height window a envoyer a la 3dBox : */
    //window.onresize = function resizeUpdate(){
    //
    //    translationLineTopLeft = 0,
    //        translationLineTopRight = document.getElementById('svg3dBox').offsetWidth,
    //        translationLineBottomLeft = 0,
    //        translationLineBottomRight = document.getElementById('svg3dBox').offsetWidth;
    //
    //    update3dBox();
    //}

})(jQuery);
