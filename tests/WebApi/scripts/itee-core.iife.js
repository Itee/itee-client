console.log('Itee.Core v1.2.0 - Standalone')
this.Itee = this.Itee || {};
this.Itee.Core = (function (exports, threeFull, iteeUtils, iteeValidators) {
	'use strict';

	if( iteeValidators === undefined ) { console.error('Itee.Core need Itee.Validators to be defined first. Please check your scripts loading order.') }
	if( iteeUtils === undefined ) { console.error('Itee.Core need Itee.Utils to be defined first. Please check your scripts loading order.') }
	if( threeFull === undefined ) { console.error('Itee.Core need Three to be defined first. Please check your scripts loading order.') }
	if( crypto === undefined ) { throw new Error('Itee.Core need crypto to be defined first !') }


	/**
	 * A freezed javascript object used like an enum.
	 * @typedef {object} Enum
	 * @constant
	 * @example
	 * var Meal = toEnum( {
	 *     Food: 'Tartiflette',
	 *     Drink: 'Saint-Emilion',
	 *     Dessert: 'Mousse au chocolat'
	 * } )
	 *
	 * if( Foo.includes('Tartiflette') {
	 *     // Happy
	 * }
	 *
	 * var myDrink = 'coke'
	 * if( myDrink === Meal.Drink ) {
	 *
	 * } else {
	 *     // Your life is a pain
	 * }
	 *
	 * var MealTypes = Meal.types
	 * // ['Tartiflette', 'Saint-Emilion', 'Mousse au chocolat' ]
	 *
	 */

	// Maths
	const Zero               = 0;
	const One                = 1;
	const Two                = 2;
	const Three              = 3;
	const Four               = 4;
	const Five               = 5;
	const Six                = 6;
	const Seven              = 7;
	const Height             = 8;
	const Nine               = 9;
	const Ten                = 10;
	const Eleven             = 11;
	const Twelve             = 12;
	const Thirteen           = 13;
	const Fourteen           = 14;
	const Fifteen            = 15;
	const Sixteen            = 16;
	const Seventeen          = 17;
	const Heighteen          = 18;
	const Nineteen           = 19;
	const Twenty             = 20;
	const TwentyOne          = 21;
	const TwentyTwo          = 22;
	const TwentyThree        = 23;
	const TwentyFour         = 24;
	const TwentyFive         = 25;
	const TwentySix          = 26;
	const TwentySeven        = 27;
	const TwentyHeight       = 28;
	const TwentyNine         = 29;
	const Thirty             = 30;
	const Fourty             = 40;
	const Fifty              = 50;
	const Sixty              = 60;
	const Seventy            = 70;
	const Heighty            = 80;
	const Ninety             = 90;
	const OneHundred         = 100;
	const FiveHundred        = 500;
	const OneThousand        = 1000;
	const TenThousand        = 10000;
	const OneHundredThousand = 100000;
	const OneMillion         = 1000000;

	const OneHalf     = 1 / 2;
	const OneThird    = 1 / 3;
	const TwoThird    = 2 / 3;
	const OneFourth   = 1 / 4;
	const TwoFourth   = 2 / 4;
	const ThreeFourth = 3 / 4;

	const SquareRootOfTwo    = Math.sqrt( Two );
	const SquareRootOfThree  = Math.sqrt( Three );
	const SquareRootOfFour   = Math.sqrt( Four );
	const SquareRootOfFive   = Math.sqrt( Five );
	const SquareRootOfSix    = Math.sqrt( Six );
	const SquareRootOfSeven  = Math.sqrt( Seven );
	const SquareRootOfHeight = Math.sqrt( Height );
	const SquareRootOfNine   = Math.sqrt( Nine );
	const SquareRootOfTen    = Math.sqrt( Ten );

	const CubeRootOfTwo    = Math.cbrt( Two );
	const CubeRootOfThree  = Math.cbrt( Three );
	const CubeRootOfFour   = Math.cbrt( Four );
	const CubeRootOfFive   = Math.cbrt( Five );
	const CubeRootOfSix    = Math.cbrt( Six );
	const CubeRootOfSeven  = Math.cbrt( Seven );
	const CubeRootOfHeight = Math.cbrt( Height );
	const CubeRootOfNine   = Math.cbrt( Nine );
	const CubeRootOfTen    = Math.cbrt( Ten );

	/**
	 * Two power of two equal 4
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwo          = Math.pow( Two, Two );
	/**
	 * Two power of three equal 8
	 * @const
	 * @type {Number}
	 */
	const TwoPowThree        = Math.pow( Two, Three );
	/**
	 * Two power of four equal 16
	 * @const
	 * @type {Number}
	 */
	const TwoPowFour         = Math.pow( Two, Four );
	/**
	 * Two power of five equal 32
	 * @const
	 * @type {Number}
	 */
	const TwoPowFive         = Math.pow( Two, Five );
	/**
	 * Two power of six equal 64
	 * @const
	 * @type {Number}
	 */
	const TwoPowSix          = Math.pow( Two, Six );
	/**
	 * Two power of seven equal 128
	 * @const
	 * @type {Number}
	 */
	const TwoPowSeven        = Math.pow( Two, Seven );
	/**
	 * Two power of height equal 256
	 * @const
	 * @type {Number}
	 */
	const TwoPowHeight       = Math.pow( Two, Height );
	/**
	 * Two power of nine equal 512
	 * @const
	 * @type {Number}
	 */
	const TwoPowNine         = Math.pow( Two, Nine );
	/**
	 * Two power of ten equal 1.024
	 * @const
	 * @type {Number}
	 */
	const TwoPowTen          = Math.pow( Two, Ten );
	/**
	 * Two power of eleven equal 2.048
	 * @const
	 * @type {Number}
	 */
	const TwoPowEleven       = Math.pow( Two, Eleven );
	/**
	 * Two power of twelve equal 4.096
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwelve       = Math.pow( Two, Twelve );
	/**
	 * Two power of thirteen equal 8.192
	 * @const
	 * @type {Number}
	 */
	const TwoPowThirteen     = Math.pow( Two, Thirteen );
	/**
	 * Two power of fourteen equal 16.384
	 * @const
	 * @type {Number}
	 */
	const TwoPowFourteen     = Math.pow( Two, Fourteen );
	/**
	 * Two power of fifteen equal 32.768
	 * @const
	 * @type {Number}
	 */
	const TwoPowFifteen      = Math.pow( Two, Fifteen );
	/**
	 * Two power of sixteen equal 65.536
	 * @const
	 * @type {Number}
	 */
	const TwoPowSixteen      = Math.pow( Two, Sixteen );
	/**
	 * Two power of seventeen equal 131.072
	 * @const
	 * @type {Number}
	 */
	const TwoPowSeventeen    = Math.pow( Two, Seventeen );
	/**
	 * Two power of heighteen equal 262.144
	 * @const
	 * @type {Number}
	 */
	const TwoPowHeighteen    = Math.pow( Two, Heighteen );
	/**
	 * Two power of nineteen equal 524.288
	 * @const
	 * @type {Number}
	 */
	const TwoPowNineteen     = Math.pow( Two, Nineteen );
	/**
	 * Two power of twenty equal 1.048.576
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwenty       = Math.pow( Two, Twenty );
	/**
	 * Two power of twenty-one equal 2.097.152
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyOne    = Math.pow( Two, TwentyOne );
	/**
	 * Two power of twenty-two equal 4.194.304
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyTwo    = Math.pow( Two, TwentyTwo );
	/**
	 * Two power of twenty-three equal 8.388.608
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyThree  = Math.pow( Two, TwentyThree );
	/**
	 * Two power of twenty-four equal 16.777.216
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyFour   = Math.pow( Two, TwentyFour );
	/**
	 * Two power of twenty-five equal 33.554.432
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyFive   = Math.pow( Two, TwentyFive );
	/**
	 * Two power of twenty-six equal 67.108.864
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentySix    = Math.pow( Two, TwentySix );
	/**
	 * Two power of twenty-seven equal 134.217.728
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentySeven  = Math.pow( Two, TwentySeven );
	/**
	 * Two power of twenty-height equal 268.435.456
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyHeight = Math.pow( Two, TwentyHeight );
	/**
	 * Two power of twenty-nine equal 536.870.912
	 * @const
	 * @type {Number}
	 */
	const TwoPowTwentyNine   = Math.pow( Two, TwentyNine );
	/**
	 * Two power of thirty equal 1.073.741.824
	 * @const
	 * @type {Number}
	 */
	const TwoPowThirty       = Math.pow( Two, Thirty );
	/**
	 * Two power of thirty-one equal 2.147.483.648
	 * @const
	 * @type {Number}
	 */
	const TwoPowThirtyOne    = Math.pow( Two, 31 );
	/**
	 * Two power of thirty-two equal 4.294.967.296
	 * @const
	 * @type {Number}
	 */
	const TwoPowThirtyTwo    = Math.pow( Two, 32 );

	const Pi       = Math.PI;
	const TwoPi    = Two * Pi;
	const ThreePi  = Three * Pi;
	const FourPi   = Four * Pi;
	const FivePi   = Five * Pi;
	const SixPi    = Six * Pi;
	const SevenPi  = Seven * Pi;
	const HeightPi = Height * Pi;
	const NinePi   = Nine * Pi;
	const TenPi    = Ten * Pi;

	const PiOnTwo    = Pi / Two;
	const PiOnThree  = Pi / Three;
	const PiOnFour   = Pi / Four;
	const PiOnFive   = Pi / Five;
	const PiOnSix    = Pi / Six;
	const PiOnSeven  = Pi / Seven;
	const PiOnHeight = Pi / Height;
	const PiOnNine   = Pi / Nine;
	const PiOnTen    = Pi / Ten;

	// Trigonometri
	const SquareRootOfTwoOnTwo   = SquareRootOfTwo / Two;
	const SquareRootOfThreeOnTwo = SquareRootOfThree / Two;

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	const Colors = {
	    Black:                new threeFull.Color( '#000000' ),
	    Navy:                 new threeFull.Color( '#000080' ),
	    DarkBlue:             new threeFull.Color( '#00008b' ),
	    MediumBlue:           new threeFull.Color( '#0000cd' ),
	    Blue:                 new threeFull.Color( '#0000ff' ),
	    DarkGreen:            new threeFull.Color( '#006400' ),
	    Green:                new threeFull.Color( '#008000' ),
	    Teal:                 new threeFull.Color( '#008080' ),
	    DarkCyan:             new threeFull.Color( '#008b8b' ),
	    DeepSkyBlue:          new threeFull.Color( '#00bfff' ),
	    DarkTurquoise:        new threeFull.Color( '#00ced1' ),
	    MediumSpringGreen:    new threeFull.Color( '#00fa9a' ),
	    Lime:                 new threeFull.Color( '#00ff00' ),
	    SpringGreen:          new threeFull.Color( '#00ff7f' ),
	    Aqua:                 new threeFull.Color( '#00ffff' ),
	    Cyan:                 new threeFull.Color( '#00ffff' ),
	    MidnightBlue:         new threeFull.Color( '#191970' ),
	    DodgerBlue:           new threeFull.Color( '#1e90ff' ),
	    LightSeaGreen:        new threeFull.Color( '#20b2aa' ),
	    ForestGreen:          new threeFull.Color( '#228b22' ),
	    SeaGreen:             new threeFull.Color( '#2e8b57' ),
	    DarkSlateGray:        new threeFull.Color( '#2f4f4f' ),
	    DarkSlateGrey:        new threeFull.Color( '#2f4f4f' ),
	    LimeGreen:            new threeFull.Color( '#32cd32' ),
	    MediumSeaGreen:       new threeFull.Color( '#3cb371' ),
	    Turquoise:            new threeFull.Color( '#40e0d0' ),
	    RoyalBlue:            new threeFull.Color( '#4169e1' ),
	    SteelBlue:            new threeFull.Color( '#4682b4' ),
	    DarkSlateBlue:        new threeFull.Color( '#483d8b' ),
	    MediumTurquoise:      new threeFull.Color( '#48d1cc' ),
	    Indigo:               new threeFull.Color( '#4b0082' ),
	    DarkOliveGreen:       new threeFull.Color( '#556b2f' ),
	    CadetBlue:            new threeFull.Color( '#5f9ea0' ),
	    CornflowerBlue:       new threeFull.Color( '#6495ed' ),
	    RebeccaPurple:        new threeFull.Color( '#663399' ),
	    MediumAquaMarine:     new threeFull.Color( '#66cdaa' ),
	    DimGray:              new threeFull.Color( '#696969' ),
	    DimGrey:              new threeFull.Color( '#696969' ),
	    SlateBlue:            new threeFull.Color( '#6a5acd' ),
	    OliveDrab:            new threeFull.Color( '#6b8e23' ),
	    SlateGray:            new threeFull.Color( '#708090' ),
	    SlateGrey:            new threeFull.Color( '#708090' ),
	    LightSlateGray:       new threeFull.Color( '#778899' ),
	    LightSlateGrey:       new threeFull.Color( '#778899' ),
	    MediumSlateBlue:      new threeFull.Color( '#7b68ee' ),
	    LawnGreen:            new threeFull.Color( '#7cfc00' ),
	    Chartreuse:           new threeFull.Color( '#7fff00' ),
	    Aquamarine:           new threeFull.Color( '#7fffd4' ),
	    Maroon:               new threeFull.Color( '#800000' ),
	    Purple:               new threeFull.Color( '#800080' ),
	    Olive:                new threeFull.Color( '#808000' ),
	    Gray:                 new threeFull.Color( '#808080' ),
	    Grey:                 new threeFull.Color( '#808080' ),
	    SkyBlue:              new threeFull.Color( '#87ceeb' ),
	    LightSkyBlue:         new threeFull.Color( '#87cefa' ),
	    BlueViolet:           new threeFull.Color( '#8a2be2' ),
	    DarkRed:              new threeFull.Color( '#8b0000' ),
	    DarkMagenta:          new threeFull.Color( '#8b008b' ),
	    SaddleBrown:          new threeFull.Color( '#8b4513' ),
	    DarkSeaGreen:         new threeFull.Color( '#8fbc8f' ),
	    LightGreen:           new threeFull.Color( '#90ee90' ),
	    MediumPurple:         new threeFull.Color( '#9370db' ),
	    DarkViolet:           new threeFull.Color( '#9400d3' ),
	    PaleGreen:            new threeFull.Color( '#98fb98' ),
	    DarkOrchid:           new threeFull.Color( '#9932cc' ),
	    YellowGreen:          new threeFull.Color( '#9acd32' ),
	    Sienna:               new threeFull.Color( '#a0522d' ),
	    Brown:                new threeFull.Color( '#a52a2a' ),
	    DarkGray:             new threeFull.Color( '#a9a9a9' ),
	    DarkGrey:             new threeFull.Color( '#a9a9a9' ),
	    LightBlue:            new threeFull.Color( '#add8e6' ),
	    GreenYellow:          new threeFull.Color( '#adff2f' ),
	    PaleTurquoise:        new threeFull.Color( '#afeeee' ),
	    LightSteelBlue:       new threeFull.Color( '#b0c4de' ),
	    PowderBlue:           new threeFull.Color( '#b0e0e6' ),
	    FireBrick:            new threeFull.Color( '#b22222' ),
	    DarkGoldenRod:        new threeFull.Color( '#b8860b' ),
	    MediumOrchid:         new threeFull.Color( '#ba55d3' ),
	    RosyBrown:            new threeFull.Color( '#bc8f8f' ),
	    DarkKhaki:            new threeFull.Color( '#bdb76b' ),
	    Silver:               new threeFull.Color( '#c0c0c0' ),
	    MediumVioletRed:      new threeFull.Color( '#c71585' ),
	    IndianRed:            new threeFull.Color( '#cd5c5c' ),
	    Peru:                 new threeFull.Color( '#cd853f' ),
	    Chocolate:            new threeFull.Color( '#d2691e' ),
	    Tan:                  new threeFull.Color( '#d2b48c' ),
	    LightGray:            new threeFull.Color( '#d3d3d3' ),
	    LightGrey:            new threeFull.Color( '#d3d3d3' ),
	    Thistle:              new threeFull.Color( '#d8bfd8' ),
	    Orchid:               new threeFull.Color( '#da70d6' ),
	    GoldenRod:            new threeFull.Color( '#daa520' ),
	    PaleVioletRed:        new threeFull.Color( '#db7093' ),
	    Crimson:              new threeFull.Color( '#dc143c' ),
	    Gainsboro:            new threeFull.Color( '#dcdcdc' ),
	    Plum:                 new threeFull.Color( '#dda0dd' ),
	    BurlyWood:            new threeFull.Color( '#deb887' ),
	    LightCyan:            new threeFull.Color( '#e0ffff' ),
	    Lavender:             new threeFull.Color( '#e6e6fa' ),
	    DarkSalmon:           new threeFull.Color( '#e9967a' ),
	    Violet:               new threeFull.Color( '#ee82ee' ),
	    PaleGoldenRod:        new threeFull.Color( '#eee8aa' ),
	    LightCoral:           new threeFull.Color( '#f08080' ),
	    Khaki:                new threeFull.Color( '#f0e68c' ),
	    AliceBlue:            new threeFull.Color( '#f0f8ff' ),
	    HoneyDew:             new threeFull.Color( '#f0fff0' ),
	    Azure:                new threeFull.Color( '#f0ffff' ),
	    SandyBrown:           new threeFull.Color( '#f4a460' ),
	    Wheat:                new threeFull.Color( '#f5deb3' ),
	    Beige:                new threeFull.Color( '#f5f5dc' ),
	    WhiteSmoke:           new threeFull.Color( '#f5f5f5' ),
	    MintCream:            new threeFull.Color( '#f5fffa' ),
	    GhostWhite:           new threeFull.Color( '#f8f8ff' ),
	    Salmon:               new threeFull.Color( '#fa8072' ),
	    AntiqueWhite:         new threeFull.Color( '#faebd7' ),
	    Linen:                new threeFull.Color( '#faf0e6' ),
	    LightGoldenRodYellow: new threeFull.Color( '#fafad2' ),
	    OldLace:              new threeFull.Color( '#fdf5e6' ),
	    Red:                  new threeFull.Color( '#ff0000' ),
	    Fuchsia:              new threeFull.Color( '#ff00ff' ),
	    Magenta:              new threeFull.Color( '#ff00ff' ),
	    DeepPink:             new threeFull.Color( '#ff1493' ),
	    OrangeRed:            new threeFull.Color( '#ff4500' ),
	    Tomato:               new threeFull.Color( '#ff6347' ),
	    HotPink:              new threeFull.Color( '#ff69b4' ),
	    Coral:                new threeFull.Color( '#ff7f50' ),
	    DarkOrange:           new threeFull.Color( '#ff8c00' ),
	    LightSalmon:          new threeFull.Color( '#ffa07a' ),
	    Orange:               new threeFull.Color( '#ffa500' ),
	    LightPink:            new threeFull.Color( '#ffb6c1' ),
	    Pink:                 new threeFull.Color( '#ffc0cb' ),
	    Gold:                 new threeFull.Color( '#ffd700' ),
	    PeachPuff:            new threeFull.Color( '#ffdab9' ),
	    NavajoWhite:          new threeFull.Color( '#ffdead' ),
	    Moccasin:             new threeFull.Color( '#ffe4b5' ),
	    Bisque:               new threeFull.Color( '#ffe4c4' ),
	    MistyRose:            new threeFull.Color( '#ffe4e1' ),
	    BlanchedAlmond:       new threeFull.Color( '#ffebcd' ),
	    PapayaWhip:           new threeFull.Color( '#ffefd5' ),
	    LavenderBlush:        new threeFull.Color( '#fff0f5' ),
	    SeaShell:             new threeFull.Color( '#fff5ee' ),
	    Cornsilk:             new threeFull.Color( '#fff8dc' ),
	    LemonChiffon:         new threeFull.Color( '#fffacd' ),
	    FloralWhite:          new threeFull.Color( '#fffaf0' ),
	    Snow:                 new threeFull.Color( '#fffafa' ),
	    Yellow:               new threeFull.Color( '#ffff00' ),
	    LightYellow:          new threeFull.Color( '#ffffe0' ),
	    Ivory:                new threeFull.Color( '#fffff0' ),
	    White:                new threeFull.Color( '#ffffff' )
	};

	Colors.UI = {
	    Default:     Colors.Fuchsia,
	    Intersected: Colors.PeachPuff,
	    Selected:    Colors.DarkOrange,
	    Active:      Colors.YellowGreen,
	    Inactive:    Colors.LightCyan,
	    Enabled:     Colors.Lavender,
	    Disabled:    Colors.Grey
	};

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	//[x:LEFT-RIGHT][y:DOWN-UP][z:BACK-FRONT]
	const Left_Down_Back   = new threeFull.Vector3( -1, -1, -1 ).normalize();
	const Left_Down        = new threeFull.Vector3( -1, -1, +0 ).normalize();
	const Left_Down_Front  = new threeFull.Vector3( -1, -1, +1 ).normalize();
	const Left_Back        = new threeFull.Vector3( -1, +0, -1 ).normalize();
	const Left             = new threeFull.Vector3( -1, +0, +0 ).normalize();
	const Left_Front       = new threeFull.Vector3( -1, +0, +1 ).normalize();
	const Left_Up_Back     = new threeFull.Vector3( -1, +1, -1 ).normalize();
	const Left_Up          = new threeFull.Vector3( -1, +1, +0 ).normalize();
	const Left_Up_Front    = new threeFull.Vector3( -1, +1, +1 ).normalize();
	const Down_Back        = new threeFull.Vector3( +0, -1, -1 ).normalize();
	const Down             = new threeFull.Vector3( +0, -1, +0 ).normalize();
	const Down_Front       = new threeFull.Vector3( +0, -1, +1 ).normalize();
	const Back             = new threeFull.Vector3( +0, +0, -1 ).normalize();
	const Null             = new threeFull.Vector3( +0, +0, +0 ).normalize();
	const Front            = new threeFull.Vector3( +0, +0, +1 ).normalize();
	const Up_Back          = new threeFull.Vector3( +0, +1, -1 ).normalize();
	const Up               = new threeFull.Vector3( +0, +1, +0 ).normalize();
	const Up_Front         = new threeFull.Vector3( +0, +1, +1 ).normalize();
	const Right_Down_Back  = new threeFull.Vector3( +1, -1, -1 ).normalize();
	const Right_Down       = new threeFull.Vector3( +1, -1, +0 ).normalize();
	const Right_Down_Front = new threeFull.Vector3( +1, -1, +1 ).normalize();
	const Right_Back       = new threeFull.Vector3( +1, +0, -1 ).normalize();
	const Right            = new threeFull.Vector3( +1, +0, +0 ).normalize();
	const Right_Front      = new threeFull.Vector3( +1, +0, +1 ).normalize();
	const Right_Up_Back    = new threeFull.Vector3( +1, +1, -1 ).normalize();
	const Right_Up         = new threeFull.Vector3( +1, +1, +0 ).normalize();
	const Right_Up_Front   = new threeFull.Vector3( +1, +1, +1 ).normalize();

	/*


	 -Z              nnw N nne
	 /|\            NW   |   NE
	  |          wnw  \  |  /  ene
	  |          W ------x------ E
	  |          wsw  /  |  \  ese
	  |             SW   |   SE
	  |              ssw S sse
	  |
	 _|_________________________________\ +X
	  |                                 /

	 */
	const Cardinales = {
	    North:            Back,
	    North_North_East: new threeFull.Vector3( OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize(),
	    North_East:       new threeFull.Vector3( SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
	    East_North_East:  new threeFull.Vector3( SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
	    East:             Right,
	    East_South_East:  new threeFull.Vector3( SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
	    South_East:       new threeFull.Vector3( SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
	    South_South_East: new threeFull.Vector3( OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
	    South:            Front,
	    South_South_West: new threeFull.Vector3( -OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
	    South_West:       new threeFull.Vector3( -SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
	    West_South_West:  new threeFull.Vector3( -SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
	    West:             Left,
	    West_North_West:  new threeFull.Vector3( -SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
	    North_West:       new threeFull.Vector3( -SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
	    North_North_West: new threeFull.Vector3( -OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize()
	};

	const Directions = {
	    Left_Down_Back,
	    Left_Down,
	    Left_Down_Front,
	    Left_Back,
	    Left,
	    Left_Front,
	    Left_Up_Back,
	    Left_Up,
	    Left_Up_Front,
	    Down_Back,
	    Down,
	    Down_Front,
	    Back,
	    Null,
	    Front,
	    Up_Back,
	    Up,
	    Up_Front,
	    Right_Down_Back,
	    Right_Down,
	    Right_Down_Front,
	    Right_Back,
	    Right,
	    Right_Front,
	    Right_Up_Back,
	    Right_Up,
	    Right_Up_Front,

	    Cardinales
	};

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} FileFormat
	 * @property {String} Asc="asc" - The ascii file format
	 * @property {String} Dae="dae" - The dae file format
	 * @property {String} Dbf="dbf" - The dbf file format
	 * @property {String} Fbx="fbx" - The fbx file format
	 * @property {String} Mtl="mtl" - The material file format
	 * @property {String} Json="json" - The json file format
	 * @property {String} Obj="obj" - The object file format
	 * @property {String} Shp="shp" - The shape file format
	 * @property {String} Stl="stl" - The stereolithographie file format
	 *
	 * @constant
	 * @type {FileFormat}
	 * @description The FileFormat Enum give some commonly used file format in 3d context
	 */
	const FileFormat = iteeUtils.toEnum( {
	    Asc:  { value: 'asc' },
	    Dae:  { value: 'dae' },
	    Dbf:  { value: 'dbf' },
	    Fbx:  { value: 'fbx' },
	    Mtl:  { value: 'mtl' },
	    Json: { value: 'json' },
	    Obj:  { value: 'obj' },
	    Shp:  { value: 'shp' },
	    Stl:  { value: 'stl' }
	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} HttpStatusCode
	 * @property {number} Continue=100 - Waiting for the continuation of the request.
	 * @property {number} SwitchingProtocols=101 - The requester has asked the server to switch protocols and the server has agreed to do so.
	 * @property {number} Processing=102 - WebDAV: Processing in progress (prevents the client from exceeding the limited waiting time).
	 * @property {number} Ok=200 - Query successfully processed.
	 * @property {number} Created=201 - Query successfully processed and a document was created.
	 * @property {number} Accepted=202 - Query processed, but without guarantee of result.
	 * @property {number} NonAuthoritativeInformation=203 - Information returned, but generated by an uncertified source.
	 * @property {number} NoContent=204 - Query successfully processed but no information returned.
	 * @property {number} ResetContent=205 - Query successfully processed, the current page can be cleared.
	 * @property {number} PartialContent=206 - Only part of the resource has been transmitted.
	 * @property {number} MultiStatus=207 - WebDAV: Multiple Response.
	 * @property {number} AlreadyReported=208 - WebDAV: The document was previously sent to this collection.
	 * @property {number} ContentDifferent=210 - WebDAV: The copy of the client-side resource differs from that of the server (content or properties).
	 * @property {number} IMUsed=226 - The server has completed the request for the resource, and the response is a representation of the result of one or more instance manipulations applied to the
	 *     current instance.
	 * @property {number} MultipleChoices=300 - The requested URI refers to multiple resources.
	 * @property {number} MovedPermanently=301 - Document moved permanently.
	 * @property {number} Found=302 - Document moved temporarily.
	 * @property {number} SeeOther=303 - The answer to this query is elsewhere.
	 * @property {number} NotModified=304 - Document not modified since the last request.
	 * @property {number} UseProxy=305 - The request must be re-addressed to the proxy.
	 * @property {number} Unused=306 - Code used by an older version of RFC 2616, now reserved.
	 * @property {number} TemporaryRedirect=307 - The request must be temporarily redirected to the specified URI.
	 * @property {number} PermanentRedirect=308 - The request must be redirected permanently to the specified URI.
	 * @property {number} TooManyRedirects=310 - The request must be redirected too many times, or is the victim of a redirection loop.
	 * @property {number} BadRequest=400 - The syntax of the query is wrong.
	 * @property {number} Unauthorized=401 - Authentication is required to access the resource.
	 * @property {number} PaymentRequired=402 - Payment required to access the resource.
	 * @property {number} Forbidden=403 - The server understood the request, but refuses to execute it. Unlike error 401, authenticating will not make any difference. On servers where authentication is
	 *     required, this usually means that authentication has been accepted but access rights do not allow the client to access the resource.
	 * @property {number} NotFound=404 - Resource not found.
	 * @property {number} MethodNotAllowed=405 - Unauthorized request method.
	 * @property {number} NotAcceptable=406 - The requested resource is not available in a format that would respect the "Accept" headers of the request.
	 * @property {number} ProxyAuthenticationRequired=407 - Access to the authorized resource by identification with the proxy.
	 * @property {number} RequestTimeOut=408 - Waiting time for an elapsed client request.
	 * @property {number} Conflict=409 - The request can not be processed in the current state.
	 * @property {number} Gone=410 - The resource is no longer available and no redirection address is known.
	 * @property {number} LengthRequired=411 - The length of the request has not been specified.
	 * @property {number} PreconditionFailed=412 - Preconditions sent by the query unverified.
	 * @property {number} RequestEntityTooLarge=413 - Abandoned processing due to excessive request
	 * @property {number} RequestURITooLong=414 - URI too long
	 * @property {number} UnsupportedMediaType=415 - Unsupported query format for a given method and resource.
	 * @property {number} RequestRangeUnsatisfiable=416 - Invalid "range" request header fields.
	 * @property {number} ExpectationFailed=417 - Expected behavior and defined in the header of the unsatisfactory request.
	 * @property {number} ImATeapot=418 - "I am a teapot". This code is defined in RFC 2324 dated April 1, 1998, Hyper Text Coffee Pot Control Protocol.
	 * @property {number} BadMapping=421 - The request was sent to a server that is not able to produce a response (for example, because a connection has been reused).
	 * @property {number} UnprocessableEntity=422 - WebDAV: The entity provided with the request is incomprehensible or incomplete.
	 * @property {number} Locked=423 - WebDAV: The operation can not take place because the resource is locked.
	 * @property {number} MethodFailure=424 - WebDAV: A method of the transaction failed.
	 * @property {number} UnorderedCollection=425 - WebDAV RFC 3648. This code is defined in the WebDAV Advanced Collections Protocol draft , but is absent from the Web Distributed Authoring and
	 *     Versioning (WebDAV) Ordered Collections Protocol.
	 * @property {number} UpgradeRequired=426 - RFC 2817 The client should change protocol, for example to TLS / 1.0 .
	 * @property {number} PreconditionRequired=428 - RFC 6585 The request must be conditional.
	 * @property {number} TooManyRequests=429 - RFC 6585 The client has issued too many requests within a given time.
	 * @property {number} RequestHeaderFieldsTooLarge=431 - RFC 6585 HTTP headers issued exceed the maximum size allowed by the server.
	 * @property {number} NoResponse=444 - Indicates that the server did not return any information to the client and closed the connection.
	 * @property {number} RetryWith=449 - Code defined by Microsoft . The request should be returned after performing an action.
	 * @property {number} BlockedByWindowsParentalControls=450 - Code defined by Microsoft. This error is generated when Windows Parental Control tools are enabled and block access to the page.
	 * @property {number} UnavailableForLegalReasons=451 - This error code indicates that the requested resource is inaccessible for legal reasons
	 * @property {number} UnrecoverableError=456 - WebDAV: Fatal error.
	 * @property {number} SSLCertificateError=495 - An extension of the 400 Bad Request error, used when the client provided an invalid certificate.
	 * @property {number} SSLCertificateRequired=496 - An extension of the 400 Bad Request error, used when a required client certificate is not provided.
	 * @property {number} HTTPRequestSentToHTTPSPort=497 - An extension of the 400 Bad Request error, used when the client sends an HTTP request to port 443 normally intended for HTTPS requests.
	 * @property {number} ClientClosedRequest=499 - The client closed the connection before receiving the response. This error occurs when the processing is too long on the server side.
	 * @property {number} InternalServerError=500 - Internal server error.
	 * @property {number} NotImplemented=501 - Functionality claimed not supported by the server.
	 * @property {number} BadGateway=502 - Wrong response sent to an intermediate server by another server.
	 * @property {number} ServiceUnavailable=503 - Service temporarily unavailable or under maintenance.
	 * @property {number} GatewayTimeOut=504 - Waiting time for a response from a server to an intermediate server that has elapsed.
	 * @property {number} HTTPVersionNotSupported=505 - HTTP version not managed by the server.
	 * @property {number} VariantAlsoNegotiates=506 - RFC 2295: Negotiation Error. Transparent content negociation.
	 * @property {number} InsufficientStorage=507 - WebDAV: Insufficient space to modify properties or build the collection.
	 * @property {number} LoopDetected=508 - WebDAV: Loop in a Resource Match
	 * @property {number} BandwidthLimitExceeded=509 - Used by many servers to indicate a quota overrun.
	 * @property {number} NotExtended=510 - RFC 2774: The request does not respect the policy for accessing extended HTTP resources.
	 * @property {number} NetworkAuthenticationRequired=511 - RFC 6585: The client must authenticate to access the network. Used by captive portals to redirect clients to the authentication page.
	 * @property {number} UnknownError=520 - Error 520 is used as a wildcard response when the origin server returns an unexpected result.
	 * @property {number} WebServerIsDown=521 - The server has refused the connection from Cloudflare.
	 * @property {number} ConnectionTimedOut=522 - Cloudflare could not negotiate a TCP handshake with the origin server.
	 * @property {number} OriginIsUnreachable=523 - Cloudflare failed to reach the origin server. This can occur if DNS server name resolution fails.
	 * @property {number} ATimeoutOccured=524 - Cloudflare established a TCP connection with the origin server but did not receive an HTTP response before the login timeout.
	 * @property {number} SSLHandshakeFailed=525 - Cloudflare could not negotiate SSL / TLS handshake with the origin server.
	 * @property {number} InvalidSSLCertificate=526 - Cloudflare could not validate the SSL certificate presented by the origin server.
	 * @property {number} RailgunError=527 - Error 527 indicates that the request has timed out or failed after the WAN connection was established.
	 *
	 * @constant
	 * @type {HttpStatusCode}
	 * @description HttpStatusCode contains all http status code available to check and process correctly server response.
	 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes} for further information.
	 */
	const HttpStatusCode = iteeUtils.toEnum( {

	    // 100
	    Continue:           { value: 100 },
	    SwitchingProtocols: { value: 101 },
	    Processing:         { value: 102 },

	    // 200
	    Ok:                          { value: 200 },
	    Created:                     { value: 201 },
	    Accepted:                    { value: 202 },
	    NonAuthoritativeInformation: { value: 203 },
	    NoContent:                   { value: 204 },
	    ResetContent:                { value: 205 },
	    PartialContent:              { value: 206 },
	    MultiStatus:                 { value: 207 },
	    AlreadyReported:             { value: 208 },
	    ContentDifferent:            { value: 210 },
	    IMUsed:                      { value: 226 },

	    // 300
	    MultipleChoices:   { value: 300 },
	    MovedPermanently:  { value: 301 },
	    Found:             { value: 302 },
	    SeeOther:          { value: 303 },
	    NotModified:       { value: 304 },
	    UseProxy:          { value: 305 },
	    Unused:            { value: 306 },
	    TemporaryRedirect: { value: 307 },
	    PermanentRedirect: { value: 308 },
	    TooManyRedirects:  { value: 310 },

	    // 400
	    BadRequest:                       { value: 400 },
	    Unauthorized:                     { value: 401 },
	    PaymentRequired:                  { value: 402 },
	    Forbidden:                        { value: 403 },
	    NotFound:                         { value: 404 },
	    MethodNotAllowed:                 { value: 405 },
	    NotAcceptable:                    { value: 406 },
	    ProxyAuthenticationRequired:      { value: 407 },
	    RequestTimeOut:                   { value: 408 },
	    Conflict:                         { value: 409 },
	    Gone:                             { value: 410 },
	    LengthRequired:                   { value: 411 },
	    PreconditionFailed:               { value: 412 },
	    RequestEntityTooLarge:            { value: 413 },
	    RequestRangeUnsatisfiable:        { value: 416 },
	    ExpectationFailed:                { value: 417 },
	    ImATeapot:                        { value: 418 },
	    BadMapping:                       { value: 421 },
	    UnprocessableEntity:              { value: 422 },
	    Locked:                           { value: 423 },
	    MethodFailure:                    { value: 424 },
	    UnorderedCollection:              { value: 425 },
	    UpgradeRequired:                  { value: 426 },
	    PreconditionRequired:             { value: 428 },
	    TooManyRequests:                  { value: 429 },
	    RequestHeaderFieldsTooLarge:      { value: 431 },
	    NoResponse:                       { value: 444 },
	    RetryWith:                        { value: 449 },
	    BlockedByWindowsParentalControls: { value: 450 },
	    UnavailableForLegalReasons:       { value: 451 },
	    UnrecoverableError:               { value: 456 },
	    SSLCertificateError:              { value: 495 },
	    SSLCertificateRequired:           { value: 496 },
	    HTTPRequestSentToHTTPSPort:       { value: 497 },
	    ClientClosedRequest:              { value: 499 },

	    // 500
	    InternalServerError:           { value: 500 },
	    NotImplemented:                { value: 501 },
	    BadGateway:                    { value: 502 },
	    ServiceUnavailable:            { value: 503 },
	    GatewayTimeOut:                { value: 504 },
	    HTTPVersionNotSupported:       { value: 505 },
	    VariantAlsoNegotiates:         { value: 506 },
	    InsufficientStorage:           { value: 507 },
	    LoopDetected:                  { value: 508 },
	    BandwidthLimitExceeded:        { value: 509 },
	    NotExtended:                   { value: 510 },
	    NetworkAuthenticationRequired: { value: 511 },
	    UnknownError:                  { value: 520 },
	    WebServerIsDown:               { value: 521 },
	    ConnectionTimedOut:            { value: 522 },
	    OriginIsUnreachable:           { value: 523 },
	    ATimeoutOccured:               { value: 524 },
	    SSLHandshakeFailed:            { value: 525 },
	    InvalidSSLCertificate:         { value: 526 },
	    RailgunError:                  { value: 527 }

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} HttpVerb
	 * @property {String} Create="PUT" - Corresponding to the create http verb for an itee server, namely "PUT".
	 * @property {String} Read="POST" - Corresponding to the read http verb for an itee server, namely "POST".
	 * @property {String} Update="PATCH" - Corresponding to the update http verb for an itee server, namely "PATCH".
	 * @property {String} Delete="DELETE" - Corresponding to the delete http verb for an itee server, namely "DELETE".
	 *
	 * @constant
	 * @type {HttpVerb}
	 * @description HttpVerb contains the CRUD actions with corresponding http verb to request an itee server.
	 * @see {@link https://en.wikipedia.org/wiki/Create,_read,_update_and_delete} for further information.
	 */
	const HttpVerb = iteeUtils.toEnum( {
	    Create: { value: 'PUT' },
	    Read:   { value: 'POST' },
	    Update: { value: 'PATCH' },
	    Delete: { value: 'DELETE' }
	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} Keys
	 * @property {Number} BACKSPACE=8 - The backspace key code
	 * @property {Number} TAB=9 - The tab key code
	 * @property {Number} ENTER=13 - The enter key code
	 * @property {Number} Etc...=* - All the rest
	 *
	 * @constant
	 * @type {Keys}
	 * @description Keys contains common keyboard key values, this allow to write semantic code instead of integer when dealing with key codes.
	 */
	const Keys = iteeUtils.toEnum( {
	    BACKSPACE:            { value: 8 },
	    TAB:                  { value: 9 },
	    ENTER:                { value: 13 },
	    SHIFT:                { value: 16 },
	    CTRL:                 { value: 17 },
	    ALT:                  { value: 18 },
	    PAUSE:                { value: 19 },
	    CAPS_LOCK:            { value: 20 },
	    ESCAPE:               { value: 27 },
	    SPACE:                { value: 32 },
	    PAGE_UP:              { value: 33 },
	    PAGE_DOWN:            { value: 34 },
	    END:                  { value: 35 },
	    HOME:                 { value: 36 },
	    LEFT_ARROW:           { value: 37 },
	    UP_ARROW:             { value: 38 },
	    RIGHT_ARROW:          { value: 39 },
	    DOWN_ARROW:           { value: 40 },
	    INSERT:               { value: 45 },
	    DELETE:               { value: 46 },
	    ZERO:                 { value: 48 },
	    ONE:                  { value: 49 },
	    TWO:                  { value: 50 },
	    THREE:                { value: 51 },
	    FOUR:                 { value: 52 },
	    FIVE:                 { value: 53 },
	    SIX:                  { value: 54 },
	    SEVEN:                { value: 55 },
	    HEIGHT:               { value: 56 },
	    NINE:                 { value: 57 },
	    A:                    { value: 65 },
	    B:                    { value: 66 },
	    C:                    { value: 67 },
	    D:                    { value: 68 },
	    E:                    { value: 69 },
	    F:                    { value: 70 },
	    G:                    { value: 71 },
	    H:                    { value: 72 },
	    I:                    { value: 73 },
	    J:                    { value: 74 },
	    K:                    { value: 75 },
	    L:                    { value: 76 },
	    M:                    { value: 77 },
	    N:                    { value: 78 },
	    O:                    { value: 79 },
	    P:                    { value: 80 },
	    Q:                    { value: 81 },
	    R:                    { value: 82 },
	    S:                    { value: 83 },
	    T:                    { value: 84 },
	    U:                    { value: 85 },
	    V:                    { value: 86 },
	    W:                    { value: 87 },
	    X:                    { value: 88 },
	    Y:                    { value: 89 },
	    Z:                    { value: 90 },
	    LEFT_WINDOW_KEY:      { value: 91 },
	    RIGHT_WINDOW_KEY:     { value: 92 },
	    SELECT_KEY:           { value: 93 },
	    NUMPAD_0:             { value: 96 },
	    NUMPAD_1:             { value: 97 },
	    NUMPAD_2:             { value: 98 },
	    NUMPAD_3:             { value: 99 },
	    NUMPAD_4:             { value: 100 },
	    NUMPAD_5:             { value: 101 },
	    NUMPAD_6:             { value: 102 },
	    NUMPAD_7:             { value: 103 },
	    NUMPAD_8:             { value: 104 },
	    NUMPAD_9:             { value: 105 },
	    MULTIPLY:             { value: 106 },
	    ADD:                  { value: 107 },
	    SUBSTRACT:            { value: 109 },
	    DECIMAL_POINT:        { value: 110 },
	    DIVIDE:               { value: 111 },
	    F1:                   { value: 112 },
	    F2:                   { value: 113 },
	    F3:                   { value: 114 },
	    F4:                   { value: 115 },
	    F5:                   { value: 116 },
	    F6:                   { value: 117 },
	    F7:                   { value: 118 },
	    F8:                   { value: 119 },
	    F9:                   { value: 120 },
	    F10:                  { value: 121 },
	    F11:                  { value: 122 },
	    F12:                  { value: 123 },
	    NUM_LOCK:             { value: 144 },
	    SCROLL_LOCK:          { value: 145 },
	    SEMICOLON:            { value: 186 },
	    EQUAL:                { value: 187 },
	    COMMA:                { value: 188 },
	    DASH:                 { value: 189 },
	    PERIODE:              { value: 190 },
	    SLASH:                { value: 191 },
	    GRAVE_ACCENT:         { value: 192 },
	    OPEN_SQUARE_BRACKET:  { value: 219 },
	    BACKSLASH:            { value: 220 },
	    CLOSE_SQUARE_BRACKET: { value: 221 },
	    SINGLE_QUOTE:         { value: 222 }
	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} MimeType
	 * @property {Number} ...
	 *
	 * @constant
	 * @type {MimeType}
	 * @description Todo...
	 */
	const MimeType = iteeUtils.toEnum( {} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} Mouse
	 * @property {Number} Wheel=-1 - The enter key code
	 * @property {Number} Left=0 - The enter key code
	 * @property {Number} Middle=1 - The enter key code
	 * @property {Number} Right=2 - The enter key code
	 *
	 * @constant
	 * @type {Mouse}
	 * @description This Mouse Enum expose 4 common state of mouse button values (Wheel, Left, Middle and Right), this allow to write semantic code instead of integer when dealing with mouse button codes.
	 */
	const Mouse = iteeUtils.toEnum( {
	    Wheel:  { value: -1 },
	    Left:   { value: 0 },
	    Middle: { value: 1 },
	    Right:  { value: 2 }
	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	/**
	 * @typedef {Enum} ResponseType
	 * @property {String} ArrayBuffer="arraybuffer" - The "arraybuffer" server response type.
	 * @property {String} Blob="blob" - The "blob" server response type.
	 * @property {String} Document="document" - The "document" server response type.
	 * @property {String} Json="json" - The "json" server response type.
	 * @property {String} DOMString="text" - The "text" server response type.
	 * @property {String} Default="text" - The "" server response type ( equivalent to DOMString ).
	 *
	 * @constant
	 * @type {ResponseType}
	 * @description ResponseType allow to filter wich type of response is recieved from the server.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType} for further information.
	 */
	const ResponseType = iteeUtils.toEnum( {
	    ArrayBuffer: { value: 'arraybuffer' },
	    Blob:        { value: 'blob' },
	    Document:    { value: 'document' },
	    Json:        { value: 'json' },
	    DOMString:   { value: 'text' },
	    Default:     { value: '' }
	} );

	/* eslint-env browser */

	/**
	 * @typedef {Enum} Keys
	 *
	 * @constant
	 * @type {Keys}
	 * @deprecated
	 * @inner
	 * @description Keys contains common keyboard key values, this allow to write semantic code instead of integer when dealing with key codes.
	 */
	const LogOutput = iteeUtils.toEnum( {
	    Console:  1,
	    Html:     2,
	    Toast:    4,
	    File:     8,
	    Database: 16,
	    All:      255
	} );

	/**
	 * @typedef {Enum} LogType
	 *
	 * @constant
	 * @type {LogType}
	 * @deprecated
	 * @description Keys contains common keyboard key values, this allow to write semantic code instead of integer when dealing with key codes.
	 */
	const LogType = iteeUtils.toEnum( {
	    Message:  0,
	    Progress: 1,
	    Time:     2
	} );

	/**
	 * @typedef {Enum} LogLevel
	 * @property {Number} None=0 - No log allowed
	 * @property {Number} Debug=1 - Allow Debug log entry
	 * @property {Number} Info=2 - Allow Info log entry
	 * @property {Number} Warning=4 - Allow Warning log entry
	 * @property {Number} Error=8 - Allow Error log entry
	 * @property {Number} All=255 - Allow all log entry
	 *
	 * @constant
	 * @type {LogLevel}
	 * @description LogLevel is a flag that allow to set which type of log is allowed
	 */
	const LogLevel = iteeUtils.toEnum( {
	    None:    0,
	    Debug:   1,
	    Info:    2,
	    Warning: 4,
	    Error:   8,
	    All:     255
	} );

	/**
	 * @class
	 * @classdesc TLogger is a fairly interface for log everthing you need, in every place you want.
	 * It can filter log input in function of severity based on LogLevel enum, and can send log to many different output like console, database, or UI.
	 */
	class TLogger {

	    /**
	     * @constructor
	     * @param {string} level - String who represent the gravity level of message between "error | warn (for warning) | other (will display like info message)"
	     * @param {string} message - the to display
	     */
	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                outputLevel: LogLevel.Error,
	                outputs:     LogOutput.Console
	            }, ...parameters
	        };

	        this.isLogger    = true;
	        this.outputLevel = _parameters.outputLevel;
	        this.outputs     = _parameters.outputs;

	        this._logsArray    = [];
	        this._timers       = {};
	        this._counterTrace = 0;

	    }

	    /**
	     *
	     * @return {*}
	     */
	    get outputLevel () {
	        return this._outputLevel
	    }

	    set outputLevel ( value ) {

	        const memberName = 'OutputLevel';
	        const expect     = 'Expect a value from LogLevel enum.';

	        if ( iteeValidators.isNull( value ) ) { throw new Error( `${ memberName } cannot be null ! ${ expect }` ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( `${ memberName } cannot be undefined ! ${ expect }` ) }
	        //        if ( !Object.keys( LogLevel ).includes( value ) ) { throw new Error( `${memberName} cannot be an instance of ${value.constructor.name}. ${expect}` ) }

	        this._outputLevel = value;

	    }

	    /**
	     *
	     * @return {*}
	     */
	    get outputs () {
	        return this._outputs
	    }

	    set outputs ( value ) {

	        const memberName = 'Output';
	        const expect     = 'Expect a value from LogOutput enum.';

	        if ( iteeValidators.isNull( value ) ) { throw new Error( `${ memberName } cannot be null ! ${ expect }` ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( `${ memberName } cannot be undefined ! ${ expect }` ) }
	        //        if ( !Object.keys( LogOutput ).includes( value ) ) { throw new Error( `${memberName} cannot be an instance of ${value.constructor.name}. ${expect}` ) }

	        this._outputs = value;

	    }

	    /**
	     * @param level
	     * @return {string}
	     * @private
	     */
	    static _levelToString ( level ) {

	        let levelString = '';

	        switch ( level ) {

	            case LogLevel.Info:
	                levelString = 'info';
	                break

	            case LogLevel.Warning:
	                levelString = 'warning';
	                break

	            case LogLevel.Error:
	                levelString = 'error';
	                break

	            default:
	                levelString = 'unknownLogLevel';
	                break

	        }

	        return levelString

	    }

	    /**
	     *
	     * @param level
	     * @param datas
	     * @return {*}
	     * @private
	     */
	    _formatTrace ( level, datas ) {

	        const levelString = TLogger._levelToString( level );
	        const tmpLevel    = `${ levelString }_${ this._counterTrace }`;

	        if ( iteeValidators.isString( datas ) ) {

	            this._logsArray[ tmpLevel ] = datas;

	        } else if ( iteeValidators.isObject( datas ) ) {

	            this._logsArray[ tmpLevel ] = TLogger._formatObjectError( datas );

	        } else if ( iteeValidators.isArrayOfString( datas ) ) {

	            this._logsArray[ tmpLevel ] = datas.toString();

	        } else if ( iteeValidators.isArrayOfObject( datas ) ) {

	            this._logsArray[ tmpLevel ] = '';

	            for ( let dataIndex = 0, numberOfDatas = datas.length ; dataIndex < numberOfDatas ; dataIndex++ ) {
	                this._formatTrace( level, datas[ dataIndex ] );
	            }

	        } else {

	            this._logsArray[ tmpLevel ] = ( datas ) ? datas.toString() : 'Empty log data !';

	        }

	        this._counterTrace++;
	        return this._logsArray[ tmpLevel ]

	    }

	    // Todo: Use listener models
	    /**
	     *
	     * @param message
	     */
	    dispatch ( message ) {

	        const type = message.type;
	        switch ( type ) {

	            case LogType.Message:
	                this._dispatchMessage( message );
	                break

	            case LogType.Progress:
	                this._dispatchProgress( message );
	                break

	            case LogType.Time:
	                this._dispatchTime( message );
	                break

	            default:
	                throw new RangeError( `Invalid switch parameter: ${ type }` )

	        }

	    }

	    /**
	     *
	     * @param message
	     * @private
	     */
	    _dispatchMessage ( message ) {

	        const level = message.level;
	        const data  = message.message;

	        // Root message in function of gravity
	        switch ( level ) {

	            case LogLevel.Error:
	                if ( this.outputLevel & LogLevel.Error ) {
	                    this._dispatchErrorMessage( data );
	                }
	                break

	            case LogLevel.Warning:
	                if ( this.outputLevel & LogLevel.Warning ) {
	                    this._dispatchWarningMessage( data );
	                }
	                break

	            case LogLevel.Info:
	                if ( this.outputLevel & LogLevel.Info ) {
	                    this._dispatchInfoMessage( data );
	                }
	                break

	            case LogLevel.Debug:
	                if ( this.outputLevel & LogLevel.Debug ) {
	                    this._dispatchDebugMessage( data );
	                }
	                break

	            // For "Debug" output, don't store trace like this !
	            default:
	                throw new RangeError( `Invalid switch parameter: ${ level }` )

	        }

	    }

	    /**
	     *
	     * @param errorMessage
	     * @private
	     */
	    _dispatchErrorMessage ( errorMessage ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.error( errorMessage );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-error' );
	            span.innerText = errorMessage;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param warnMessage
	     * @private
	     */
	    _dispatchWarningMessage ( warnMessage ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.warn( warnMessage );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-warning' );
	            span.innerText = warnMessage;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param infoMessage
	     * @private
	     */
	    _dispatchInfoMessage ( infoMessage ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.log( infoMessage );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-info' );
	            span.innerText = infoMessage;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param debugMessage
	     * @private
	     */
	    _dispatchDebugMessage ( debugMessage ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.log( debugMessage );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-info' );
	            span.innerText = debugMessage;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param progress
	     * @private
	     */
	    _dispatchProgress ( progress ) {

	        const level          = progress.level;
	        let formattedMessage = progress.message;

	        // Root message in function of gravity
	        switch ( level ) {

	            case LogLevel.Info:
	                if ( this.outputLevel & LogLevel.Info ) {
	                    this._dispatchInfoProgress( formattedMessage );
	                }
	                break

	            case LogLevel.Debug:
	                if ( this.outputLevel & LogLevel.Debug ) {
	                    this._dispatchDebugProgress( formattedMessage );
	                }
	                break

	            // For "Debug" output, don't store trace like this !
	            default:
	                throw new RangeError( `Invalid progress level parameter: ${ level }` )

	        }

	    }

	    /**
	     *
	     * @param infoProgress
	     * @private
	     */
	    _dispatchInfoProgress ( infoProgress ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.log( infoProgress );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-info' );
	            span.innerText = infoProgress;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param debugProgress
	     * @private
	     */
	    _dispatchDebugProgress ( debugProgress ) {

	        if ( this.outputs & LogOutput.Console ) {

	            // eslint-disable-next-line no-console
	            console.log( debugProgress );

	        }

	        if ( this.outputs & LogOutput.Html ) {

	            const span = document.createElement( 'span' );
	            span.classList.add( 'log-info' );
	            span.innerText = debugProgress;
	            document.body.appendChild( span );

	        }

	        if ( this.outputs & LogOutput.Toast ) ;

	        if ( this.outputs & LogOutput.File ) ;

	        if ( this.outputs & LogOutput.Database ) ;

	    }

	    /**
	     *
	     * @param time
	     * @private
	     */
	    _dispatchTime ( time ) {

	        // eslint-disable-next-line no-console
	        console.log( time.message );

	    }

	    /**
	     *
	     * @param debug
	     */
	    debug ( debug ) {

	        this.dispatch( {
	            type:    LogType.Message,
	            level:   LogLevel.Debug,
	            message: debug
	        } );

	    }

	    /**
	     *
	     * @param info
	     */
	    log ( info ) {

	        this.dispatch( {
	            type:    LogType.Message,
	            level:   LogLevel.Info,
	            message: info
	        } );

	    }

	    /**
	     *
	     * @param warning
	     */
	    warn ( warning ) {

	        this.dispatch( {
	            type:    LogType.Message,
	            level:   LogLevel.Warning,
	            message: warning
	        } );

	    }

	    /**
	     *
	     * @param error
	     */
	    error ( error ) {

	        this.dispatch( {
	            type:    LogType.Message,
	            level:   LogLevel.Error,
	            message: error
	        } );

	    }

	    /**
	     *
	     * @param progress
	     */
	    progress ( progress ) {

	        progress.preventDefault();
	        if ( progress.cancelable ) {
	            progress.stopImmediatePropagation();
	        }

	        if ( progress.lengthComputable ) {

	            const type        = progress.type;
	            const loaded      = progress.loaded;
	            const total       = progress.total;
	            const advancement = Math.round( ( loaded / total ) * 10000 ) / 100;
	            const message     = `${ type }: ${ advancement }% [${ loaded }/${ total }]`;

	            this.dispatch( {
	                type:    LogType.Progress,
	                level:   LogLevel.Info,
	                message: message
	            } );

	        }

	    }

	    /**
	     *
	     * @param key
	     */
	    startChronoFor ( key ) {

	        this._timers[ key ] = new Date().getTime();

	    }

	    /**
	     *
	     * @param key
	     */
	    stopChronoFor ( key ) {

	        const deltaTime = ( new Date().getTime() - this._timers[ key ] );
	        const message   = `${ key } take ${ deltaTime }ms.`;

	        this.dispatch( {
	            type:    LogType.Time,
	            level:   LogLevel.Debug,
	            message: message
	        } );

	    }

	    /**
	     *
	     * @param value
	     * @return {TLogger}
	     */
	    setOutputLevel ( value ) {

	        this.outputLevel = value;
	        return this

	    }

	    /**
	     *
	     * @param value
	     * @return {TLogger}
	     */
	    setOutput ( value ) {

	        this.outputs = value;
	        return this

	    }

	}

	/**
	 * A default logger instance that can be use everywhere it is needed.
	 * @type {TLogger}
	 */
	const DefaultLogger = new TLogger();

	// Unique ID creation requires a high quality random # generator. In the browser we therefore
	// require the crypto API and do not support built-in fallback to lower quality random number
	// generators (like Math.random()).
	var getRandomValues;
	var rnds8 = new Uint8Array(16);
	function rng() {
	  // lazy load so that environments that need to polyfill have a chance to do so
	  if (!getRandomValues) {
	    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
	    // find the complete implementation of crypto (msCrypto) on IE11.
	    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

	    if (!getRandomValues) {
	      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
	    }
	  }

	  return getRandomValues(rnds8);
	}

	var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

	function validate(uuid) {
	  return typeof uuid === 'string' && REGEX.test(uuid);
	}

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */

	var byteToHex = [];

	for (var i = 0; i < 256; ++i) {
	  byteToHex.push((i + 0x100).toString(16).substr(1));
	}

	function stringify(arr) {
	  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	  // Note: Be careful editing this code!  It's been tuned for performance
	  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
	  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
	  // of the following:
	  // - One or more input array values don't map to a hex octet (leading to
	  // "undefined" in the uuid)
	  // - Invalid input values for the RFC `version` or `variant` fields

	  if (!validate(uuid)) {
	    throw TypeError('Stringified UUID is invalid');
	  }

	  return uuid;
	}

	function v4(options, buf, offset) {
	  options = options || {};
	  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	  rnds[6] = rnds[6] & 0x0f | 0x40;
	  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

	  if (buf) {
	    offset = offset || 0;

	    for (var i = 0; i < 16; ++i) {
	      buf[offset + i] = rnds[i];
	    }

	    return buf;
	  }

	  return stringify(rnds);
	}

	function version(uuid) {
	  if (!validate(uuid)) {
	    throw TypeError('Invalid UUID');
	  }

	  return parseInt(uuid.substr(14, 1), 16);
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 */

	class TAbstractObject {

	    constructor ( parameters = {} ) {

	        const _uuid       = v4();
	        const _name       = `${ this.constructor.name }_${ _uuid }`;
	        const _parameters = {
	            ...{
	                uuid:   _uuid,
	                name:   _name,
	                logger: null
	            },
	            ...parameters
	        };

	        this.uuid   = _parameters.uuid;
	        this.name   = _parameters.name;
	        this.logger = _parameters.logger;
	    }

	    get name () {
	        return this._name
	    }

	    set name ( value ) {
	        const memberName = 'name';
	        const expect     = 'Expect a String';

	        if ( iteeValidators.isNull( value ) ) { throw new Error( `${ memberName } cannot be null ! ${ expect }` ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( `${ memberName } cannot be undefined ! ${ expect }` ) }
	        if ( iteeValidators.isNotString( value ) ) { throw new ReferenceError( 'TAbstractObject.name: Value cannot be null or undefined. Expect an  !' ) }

	        this._name = value;
	    }

	    get uuid () {
	        return this._uuid
	    }

	    set uuid ( value ) {
	        const memberName = 'uuid';
	        const expect     = 'Expect an uuid v4.';

	        if ( iteeValidators.isNull( value ) ) { throw new Error( `${ memberName } cannot be null ! ${ expect }` ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( `${ memberName } cannot be undefined ! ${ expect }` ) }
	        if ( !validate( value ) || version( value ) !== 4 ) { throw new Error( `Unable to set invalid uuid [${ value }] ! ${ expect }` ) }

	        this._uuid = value;
	    }

	    getName ( target ) {
	        target.name = this.name;
	        return this
	    }

	    setName ( value ) {
	        this.name = value;
	        return this
	    }

	    getUuid ( target ) {
	        target.uuid = this.uuid;
	        return this
	    }

	    setUuid ( value ) {
	        this.uuid = value;
	        return this
	    }

	}

	exports.Colors = Colors;
	exports.CubeRootOfFive = CubeRootOfFive;
	exports.CubeRootOfFour = CubeRootOfFour;
	exports.CubeRootOfHeight = CubeRootOfHeight;
	exports.CubeRootOfNine = CubeRootOfNine;
	exports.CubeRootOfSeven = CubeRootOfSeven;
	exports.CubeRootOfSix = CubeRootOfSix;
	exports.CubeRootOfTen = CubeRootOfTen;
	exports.CubeRootOfThree = CubeRootOfThree;
	exports.CubeRootOfTwo = CubeRootOfTwo;
	exports.DefaultLogger = DefaultLogger;
	exports.Directions = Directions;
	exports.Eleven = Eleven;
	exports.Fifteen = Fifteen;
	exports.Fifty = Fifty;
	exports.FileFormat = FileFormat;
	exports.Five = Five;
	exports.FiveHundred = FiveHundred;
	exports.FivePi = FivePi;
	exports.Four = Four;
	exports.FourPi = FourPi;
	exports.Fourteen = Fourteen;
	exports.Fourty = Fourty;
	exports.Height = Height;
	exports.HeightPi = HeightPi;
	exports.Heighteen = Heighteen;
	exports.Heighty = Heighty;
	exports.HttpStatusCode = HttpStatusCode;
	exports.HttpVerb = HttpVerb;
	exports.Keys = Keys;
	exports.LogLevel = LogLevel;
	exports.LogOutput = LogOutput;
	exports.LogType = LogType;
	exports.MimeType = MimeType;
	exports.Mouse = Mouse;
	exports.Nine = Nine;
	exports.NinePi = NinePi;
	exports.Nineteen = Nineteen;
	exports.Ninety = Ninety;
	exports.One = One;
	exports.OneFourth = OneFourth;
	exports.OneHalf = OneHalf;
	exports.OneHundred = OneHundred;
	exports.OneHundredThousand = OneHundredThousand;
	exports.OneMillion = OneMillion;
	exports.OneThird = OneThird;
	exports.OneThousand = OneThousand;
	exports.Pi = Pi;
	exports.PiOnFive = PiOnFive;
	exports.PiOnFour = PiOnFour;
	exports.PiOnHeight = PiOnHeight;
	exports.PiOnNine = PiOnNine;
	exports.PiOnSeven = PiOnSeven;
	exports.PiOnSix = PiOnSix;
	exports.PiOnTen = PiOnTen;
	exports.PiOnThree = PiOnThree;
	exports.PiOnTwo = PiOnTwo;
	exports.ResponseType = ResponseType;
	exports.Seven = Seven;
	exports.SevenPi = SevenPi;
	exports.Seventeen = Seventeen;
	exports.Seventy = Seventy;
	exports.Six = Six;
	exports.SixPi = SixPi;
	exports.Sixteen = Sixteen;
	exports.Sixty = Sixty;
	exports.SquareRootOfFive = SquareRootOfFive;
	exports.SquareRootOfFour = SquareRootOfFour;
	exports.SquareRootOfHeight = SquareRootOfHeight;
	exports.SquareRootOfNine = SquareRootOfNine;
	exports.SquareRootOfSeven = SquareRootOfSeven;
	exports.SquareRootOfSix = SquareRootOfSix;
	exports.SquareRootOfTen = SquareRootOfTen;
	exports.SquareRootOfThree = SquareRootOfThree;
	exports.SquareRootOfThreeOnTwo = SquareRootOfThreeOnTwo;
	exports.SquareRootOfTwo = SquareRootOfTwo;
	exports.SquareRootOfTwoOnTwo = SquareRootOfTwoOnTwo;
	exports.TAbstractObject = TAbstractObject;
	exports.TLogger = TLogger;
	exports.Ten = Ten;
	exports.TenPi = TenPi;
	exports.TenThousand = TenThousand;
	exports.Thirteen = Thirteen;
	exports.Thirty = Thirty;
	exports.Three = Three;
	exports.ThreeFourth = ThreeFourth;
	exports.ThreePi = ThreePi;
	exports.Twelve = Twelve;
	exports.Twenty = Twenty;
	exports.TwentyFive = TwentyFive;
	exports.TwentyFour = TwentyFour;
	exports.TwentyHeight = TwentyHeight;
	exports.TwentyNine = TwentyNine;
	exports.TwentyOne = TwentyOne;
	exports.TwentySeven = TwentySeven;
	exports.TwentySix = TwentySix;
	exports.TwentyThree = TwentyThree;
	exports.TwentyTwo = TwentyTwo;
	exports.Two = Two;
	exports.TwoFourth = TwoFourth;
	exports.TwoPi = TwoPi;
	exports.TwoPowEleven = TwoPowEleven;
	exports.TwoPowFifteen = TwoPowFifteen;
	exports.TwoPowFive = TwoPowFive;
	exports.TwoPowFour = TwoPowFour;
	exports.TwoPowFourteen = TwoPowFourteen;
	exports.TwoPowHeight = TwoPowHeight;
	exports.TwoPowHeighteen = TwoPowHeighteen;
	exports.TwoPowNine = TwoPowNine;
	exports.TwoPowNineteen = TwoPowNineteen;
	exports.TwoPowSeven = TwoPowSeven;
	exports.TwoPowSeventeen = TwoPowSeventeen;
	exports.TwoPowSix = TwoPowSix;
	exports.TwoPowSixteen = TwoPowSixteen;
	exports.TwoPowTen = TwoPowTen;
	exports.TwoPowThirteen = TwoPowThirteen;
	exports.TwoPowThirty = TwoPowThirty;
	exports.TwoPowThirtyOne = TwoPowThirtyOne;
	exports.TwoPowThirtyTwo = TwoPowThirtyTwo;
	exports.TwoPowThree = TwoPowThree;
	exports.TwoPowTwelve = TwoPowTwelve;
	exports.TwoPowTwenty = TwoPowTwenty;
	exports.TwoPowTwentyFive = TwoPowTwentyFive;
	exports.TwoPowTwentyFour = TwoPowTwentyFour;
	exports.TwoPowTwentyHeight = TwoPowTwentyHeight;
	exports.TwoPowTwentyNine = TwoPowTwentyNine;
	exports.TwoPowTwentyOne = TwoPowTwentyOne;
	exports.TwoPowTwentySeven = TwoPowTwentySeven;
	exports.TwoPowTwentySix = TwoPowTwentySix;
	exports.TwoPowTwentyThree = TwoPowTwentyThree;
	exports.TwoPowTwentyTwo = TwoPowTwentyTwo;
	exports.TwoPowTwo = TwoPowTwo;
	exports.TwoThird = TwoThird;
	exports.Zero = Zero;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, Three, Itee.Utils, Itee.Validators);
//# sourceMappingURL=itee-core.iife.js.map
