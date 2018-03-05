/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

var config = {
    el:       '#root',
    data: {},
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
                    <TToolItem icon="fa fa-home" :onClickHandler=alertFooBar />
                    <TToolItem icon="fa fa-eye" :onClickHandler=alertFooBar />
                    <TToolItem icon="fa fa-cloud" :onClickHandler=alertFooBar />
                </TToolBar>
            </THeader>
            <TContent>
                <TSplitter :isVertical=true :initPosition=20>                    
                    <TLabel slot="left" label="FooBar" />
                    <TViewport3D slot="right" />
                </TSplitter>
            </TContent>
            <TFooter>
                Footer
            </TFooter>
        </TContainer>
    `,
    methods:  {
        alertFooBar() {
            'use strict'
            alert('FooBar: ' + this.offsetHeight )
        }
    }
}
