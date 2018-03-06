/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* global Itee */

var config = {
    el:       '#root',
    data:     {
        scene:     new Itee.Scene(),
        treeItems: []
    },
    template: `
        <TContainer orientation="vertical" hAlign="stretch" vAlign="start" expand=true>
       
            <THeader>
                <TAppBar height="60px">
                    <TContainer vAlign="center" hAlign="start">
                        <TLabel class="tBrand" label="ITEE" icon="fa fa-rocket" />
                    </TContainer>
                    <TMenu>
                        <TMenuItem label="Home" :onClickHandler=alertFooBar />
                        <TMenuItem label="Documentation" />
                        <TMenuItem label="Téléversement" />
                        <TMenuDropDown popAt="bottom" label="Tutoriel">
                            <TMenuItem label="SubMenuA" :onClickHandler=alertFooBar />
                            <TMenuItem label="SubMenuB" :onClickHandler=alertFooBar />
                            <TMenuDropDown popAt="rightUp" label="SubDropDown">
                                <TMenuItem label="SubSubMenuA" :onClickHandler=alertFooBar />
                                <TMenuItem label="SubSubMenuB" :onClickHandler=alertFooBar />
                                <TMenuItem label="SubSubMenuC" :onClickHandler=alertFooBar />
                                <TMenuDropDown popAt="rightUp" label="SubSubDropDown">
                                    <TMenuItem label="FarAwayMenuA" :onClickHandler=alertFooBar />
                                    <TMenuItem label="FarAwayMenuB" :onClickHandler=alertFooBar />
                                    <TMenuItem label="FarAwayMenuC" :onClickHandler=alertFooBar />
                                    <TMenuItem label="FarAwayMenuD" :onClickHandler=alertFooBar />
                                    <TMenuItem label="FarAwayMenuE" :onClickHandler=alertFooBar />
                                </TMenuDropDown>
                            </TMenuDropDown>
                            <TMenuItem label="SubMenuC" :onClickHandler=alertFooBar />
                            <TMenuItem label="SubMenuD" :onClickHandler=alertFooBar />
                            <TMenuItem label="SubMenuE" :onClickHandler=alertFooBar />
                        </TMenuDropDown>
                        <TMenuItem label="A propos" :onClickHandler=alertFooBar />
                    </TMenu>
                    <TContainer vAlign="center" hAlign="end">
                        <div>loginbtn</div>
                    </TContainer>
                </TAppBar>
                <TToolBar>
                    <TToolItem icon="fa fa-home" :onClickHandler=addCube />
                    <TToolItem icon="fa fa-eye" :onClickHandler=alertFooBar />
                    <TToolItem icon="fa fa-cloud" :onClickHandler=alertFooBar />
                    <TToolDropDown popAt="bottom" icon="fa fa-th">
                        <TToolItem label="Plan XY" :onClickHandler=alertFooBar />
                        <TToolItem label="Plan XZ" :onClickHandler=alertFooBar />
                        <TToolItem label="Plan YZ" :onClickHandler=alertFooBar />
                    </TToolDropDown>
                </TToolBar>
            </THeader>
            <TContent>
                <TSplitter :isVertical=true :initPosition=20>
                    <TTree slot="left" :items="scene.children" :filter=filterTreeItem></TTree>
                    <TViewport3D slot="right" :scene="scene" />
                </TSplitter>
            </TContent>
            <TFooter>
                Footer
            </TFooter>
        </TContainer>
    `,
    methods:  {
        alertFooBar () {
            'use strict'
            alert( 'foo bar' )
        },

        addCube () {
            'use strict'

            const mainGroup     = new Itee.Group()
            mainGroup.name      = "MainGroup"
            mainGroup.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( mainGroup )
                }
            ]
            this.scene.add( mainGroup )

            const group     = new Itee.Group()
            group.name      = "MyGroup"
            group.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( group )
                },
                {
                    type:     'range',
                    onChange: function onChangeHandler ( changeEvent ) {

                        const opacity  = changeEvent.target.valueAsNumber / 100
                        const children = group.children

                        let child = undefined
                        for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {
                            child = children[ childIndex ]

                            if ( !child.material.transparent ) {
                                child.material.transparent = true
                            }
                            child.material.opacity = opacity

                        }

                    }
                }
            ]
            mainGroup.add( group )

            const gridHelperXZ     = new Itee.GridHelper( 100, 100 )
            gridHelperXZ.name      = "gridHelperZ"
            gridHelperXZ.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( gridHelperXZ )
                }
            ]
            group.add( gridHelperXZ )

            const gridHelperXY     = new Itee.GridHelper( 100, 100 )
            gridHelperXY.name      = "gridHelperX"
            gridHelperXY.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( gridHelperXY )
                }
            ]
            gridHelperXY.rotateX( Itee.radiansFromDegrees( 90 ) )
            group.add( gridHelperXY )

            const gridHelperYZ     = new Itee.GridHelper( 100, 100 )
            gridHelperYZ.name      = "gridHelperZ"
            gridHelperYZ.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( gridHelperYZ )
                }
            ]
            gridHelperYZ.rotateZ( Itee.radiansFromDegrees( 90 ) )
            group.add( gridHelperYZ )

            // ----

            const cubeGroup     = new Itee.Group()
            cubeGroup.name      = "Cubes"
            cubeGroup.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( cubeGroup )
                }
            ]
            mainGroup.add( cubeGroup )

            const geometry   = new Itee.BoxBufferGeometry( 1, 1, 1 )
            const material   = new Itee.MeshPhongMaterial( 0x0096FF )
            const tCube1     = new Itee.Mesh( geometry, material )
            tCube1.name      = "tCube1"
            tCube1.modifiers = [
                {
                    type:    'checkbox',
                    value:   'checked',
                    onClick: this.toggleVisibilityOf( tCube1 )
                },
                {
                    type:     'range',
                    onChange: function onChangeHandler ( changeEvent ) {

                        const opacity = changeEvent.target.valueAsNumber / 100

                        if ( !tCube1.material.transparent ) {
                            tCube1.material.transparent = true
                        }

                        tCube1.material.opacity = opacity

                    }
                }
            ]
            cubeGroup.add( tCube1 )

        },

        addTreeItem () {
            'use strict'

            //            if( !parent.children ) {
            //                parent.children = []
            //            }

            this.treeItems.push( {
                id:        "quxId",
                name:      "quxName",
                isChecked: false,
                modifiers: [
                    {
                        type:    'button',
                        value:   'Add',
                        onClick: this.addTreeItem
                    },
                    {
                        type:    'button',
                        value:   'Remove',
                        onClick: this.removeTreeItem
                    }
                ]
            } )

        },
        removeTreeItem ( parent ) {
            'use strict'
            console.log( "remove item" )
        },
        filterTreeItem ( item ) {
            'use strict'

            return item.name.length > 3

        },
        toggleVisibilityOf ( object ) {
            'use strict'

            const _object = object

            return function toggleVisibility () {
                _object.visible = !_object.visible
            }

        }
    }
}
