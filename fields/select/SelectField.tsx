// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import React from 'react';
import './SelectField.scss';
import UserInterfaceClassName from "../../constants/UserInterfaceClassName";
import SelectFieldModel, {SelectFieldItem} from "../../types/items/SelectFieldModel";
import FieldProps from '../FieldProps';
import LogService from "../../../../ts/LogService";
import {findIndex, map, some} from "../../../../ts/modules/lodash";
import Popup from "../../popup/Popup";
import {EventCallback, VoidCallback} from "../../../../ts/interfaces/callbacks";
import Button from "../../button/Button";
import FormFieldState, { stringifyFormFieldState } from "../../types/FormFieldState";

const LOG = LogService.createLogger('SelectField');
const COMPONENT_CLASS_NAME = UserInterfaceClassName.SELECT_FIELD;
const CLOSE_DROPDOWN_TIMEOUT_ON_BLUR = 100;
const MOVE_TO_ITEM_ON_OPEN_DROPDOWN_TIMEOUT = 100;

export interface SelectFieldState {
    readonly fieldState   : FormFieldState;
    readonly dropdownOpen : boolean;
}

export interface SelectFieldProps<T> extends FieldProps<SelectFieldModel<T>, T> {
    readonly values : SelectFieldItem<T>[];
}

export class SelectField extends React.Component<SelectFieldProps<any>, SelectFieldState> {

    private readonly _inputRef        : React.RefObject<HTMLInputElement>;
    private readonly _focusCallback   : VoidCallback;
    private readonly _blurCallback    : VoidCallback;
    private readonly _keyDownCallback : EventCallback<React.KeyboardEvent>;
    private readonly _buttonRefs      : React.RefObject<HTMLButtonElement>[];

    private _fieldState           : FormFieldState;
    private _closeDropdownTimeout : any;
    private _openDropdownTimeout  : any;


    public constructor(props: SelectFieldProps<any>) {
        super(props);
        this._fieldState = FormFieldState.CONSTRUCTED;
        this.state = {
            dropdownOpen : false,
            fieldState   : this._fieldState
        };
        this._buttonRefs = [];
        this._inputRef = React.createRef();
        this._focusCallback = this._onFocus.bind(this);
        this._blurCallback  = this._onBlur.bind(this);
        this._keyDownCallback = this._onKeyDown.bind(this);
    }

    public getKey () : string {
        return this.props?.model?.key ?? '';
    }

    public getLabel () : string {
        return this.props?.label ?? this.props.model?.label ?? '';
    }

    public getIdentifier () : string {
        return `#${this.getKey()}: "${this.getLabel()}"`;
    }

    public componentDidMount () {
        if ( this._inputHasFocus() ) {
            this._openDropdown();
            this._delayedMoveToFirstItem();
        }
        this._setFieldState(FormFieldState.MOUNTED);
        this._updateFieldState();
    }

    public componentDidUpdate (
        prevProps: Readonly<SelectFieldProps<any>>,
        prevState: Readonly<SelectFieldState>,
        snapshot?: any
    ): void {
        if (   prevProps.value  !== this.props.value
            || prevProps.values !== this.props.values
            || prevProps.model  !== this.props.model
        ) {
            LOG.debug(`${this.getIdentifier()}: componentDidUpdate: `, this.props);
            this._updateFieldState();
        } else {
            LOG.debug(`${this.getIdentifier()}: componentDidUpdate: but we didn't need anything: `, this.props);
        }
    }

    public componentWillUnmount () {
        if (this._closeDropdownTimeout) {
            clearTimeout(this._closeDropdownTimeout);
            this._closeDropdownTimeout = undefined;
        }
        if (this._openDropdownTimeout) {
            clearTimeout(this._openDropdownTimeout);
            this._openDropdownTimeout = undefined;
        }
        this._setFieldState(FormFieldState.UNMOUNTED);
    }

    public render () {

        const label        : string = this.props?.label          ?? this.props.model?.label       ?? '';
        const placeholder  : string = this.props?.placeholder    ?? this.props.model?.placeholder ?? '';

        const selectItems       : SelectFieldItem<any>[] = this._getValues();
        const currentItemIndex  : number | undefined = this._getCurrentIndex();
        const selectedItem      : SelectFieldItem<any> | undefined = currentItemIndex !== undefined ? selectItems[currentItemIndex] : undefined;
        const selectedItemLabel : string = selectedItem?.label ?? '';

        const fieldState        : string = stringifyFormFieldState( this._fieldState );

        LOG.debug(`${this.getIdentifier()}: render: selectedItem = `, selectedItem, selectedItemLabel);

        return (
            <div
                className={
                    `${COMPONENT_CLASS_NAME} ${UserInterfaceClassName.FIELD}`
                    + ' ' + (this.props.className ?? '')
                    + ` ${UserInterfaceClassName.FIELD}-state-${fieldState}`
                }
            >

                <label className={COMPONENT_CLASS_NAME + '-label'}>

                    {label ? (
                        <span className={COMPONENT_CLASS_NAME+'-label'}>{label}</span>
                    ) : null}

                    <input
                       ref={this._inputRef}
                       className={COMPONENT_CLASS_NAME+'-input'}
                       type="text"
                       autoComplete="off"
                       placeholder={placeholder}
                       value={selectedItemLabel}
                       onFocus={this._focusCallback}
                       onBlur={this._blurCallback}
                       onChange={(event) => {
                           SelectField._cancelKeyEvent(event);
                       }}
                       onKeyDown={this._keyDownCallback}
                    />

                    {this.props.children}

                </label>

                <Popup open={this.state.dropdownOpen}>
                    <div className={COMPONENT_CLASS_NAME + '-dropdown'}>
                        {map(selectItems, (selectItem : SelectFieldItem<any>, itemIndex: number) : any => {

                            const isCurrentButton = currentItemIndex !== undefined && itemIndex === currentItemIndex;

                            const itemClickCallback = () => this._selectItem(itemIndex);

                            if (itemIndex >= this._buttonRefs.length) {
                                this._buttonRefs[itemIndex] = React.createRef<HTMLButtonElement>();
                            }

                            const itemButtonRef = this._buttonRefs[itemIndex];

                            return (
                                <Button
                                    key={`dropdown-item-${itemIndex}-value-${selectItem.value}`}
                                    buttonRef={itemButtonRef}
                                    className={
                                        COMPONENT_CLASS_NAME + '-dropdown-item'
                                        + ' ' + (isCurrentButton ? COMPONENT_CLASS_NAME + '-dropdown-item-current' : '')
                                    }
                                    focus={this._focusCallback}
                                    blur={this._blurCallback}
                                    click={itemClickCallback}
                                    keyDown={this._keyDownCallback}
                                >{selectItem?.label ?? ''}</Button>
                            );

                        })}
                    </div>
                </Popup>

            </div>
        );

    }


    private _getCurrentIndex () : number | undefined {
        return this.props.value !== undefined ? this._findValueIndex(this.props.value) : undefined;
    }

    /**
     * Search the index of the value in all items
     *
     * @private
     */
    private _findValueIndex (value : any) : number | undefined {

        LOG.debug(`${this.getIdentifier()}: _findValueIndex: value: `, value);

        const items : SelectFieldItem<any>[] = this._getValues();
        LOG.debug(`${this.getIdentifier()}: _findValueIndex: items: `, items);

        const index : number = findIndex(
            items,
            (item : SelectFieldItem<any>) : boolean => item.value === value
        );

        if (index >= 0 && index < items.length) {
            LOG.debug(`${this.getIdentifier()}: _findValueIndex: found: `, index);
            return index;
        }

        LOG.debug(`${this.getIdentifier()}: _findValueIndex: not found`);
        return undefined;

    }

    private _setFieldState (value : FormFieldState) {

        this._fieldState = value;

        if (this.state.fieldState !== value) {
            this.setState({fieldState: value});
            LOG.debug(`${this.getIdentifier()}: Changed state as `, stringifyFormFieldState(value));
        }

        if (this.props?.changeState) {
            this.props.changeState(value);
        }

    }

    private _updateFieldState () {

        LOG.debug(`${this.getIdentifier()}: _updateFieldState: state: `, stringifyFormFieldState(this._fieldState));

        if ( this._fieldState < FormFieldState.MOUNTED ) return;
        if ( this._fieldState >= FormFieldState.UNMOUNTED ) return;

        let itemValue : any | undefined = this.props.value;
        LOG.debug(`${this.getIdentifier()}: _updateFieldState: item: `, itemValue);

        const isValid = this._validateValue(
            itemValue,
            this.props?.model?.required ?? false
        );
        LOG.debug(`${this.getIdentifier()}: _updateFieldState: isValid "${itemValue}": `, isValid);

        this._setFieldState( isValid ? FormFieldState.VALID : FormFieldState.INVALID );

    }

    private _validateValue (
        internalValue : any | undefined,
        required      : boolean
    ) : boolean {

        LOG.debug(`${this.getIdentifier()}: _validateValue: internalValue = `, internalValue);

        if ( internalValue === undefined ) {
            LOG.debug(`${this.getIdentifier()}: _validateValue: "${internalValue}": required = `, required);
            return !required;
        }

        const values = map(
            this._getValues(),
            (item : SelectFieldItem<any>) : any => item.value
        );

        const matches : boolean = values.includes(internalValue);

        LOG.debug(`${this.getIdentifier()}: _validateValue: "${internalValue}": matches= `, matches, values);

        return matches;

    }

    private _change (value: any) {

        LOG.debug(`${this.getIdentifier()}: _change: value = `, value);

        if (this.props.change) {
            try {
                this.props.change(value);
            } catch (err) {
                LOG.error('Error in change prop: ', err);
            }
        } else {
            LOG.warn(`${this.getIdentifier()}: Warning! No change prop defined!`);
        }

    }

    private _selectItem (index: number) {

        LOG.debug(`${this.getIdentifier()}: _selectItem: Selecting index `, index);

        const selectItems : SelectFieldItem<any>[] = this._getValues();
        if ( index >= 0 && index < selectItems.length ) {
            this._change(selectItems[index].value);
            this._closeDropdown();
        } else {
            LOG.error('_selectItem: Index out of range:', index);
        }

    }

    private _getValues () : SelectFieldItem<any>[] {
        return this.props?.values ?? this.props?.model?.values ?? [];
    }

    private _inputHasFocus () : boolean {

        if (!document.hasFocus()) {
            return false;
        }

        const inputElement         : HTMLInputElement | null | undefined = this._inputRef?.current;

        const inputElementHasFocus : boolean = inputElement ? SelectField._elementHasFocus(inputElement) : false;

        return inputElementHasFocus || some(this._buttonRefs, (item: React.RefObject<HTMLButtonElement>) : boolean => {
            const currentElement : HTMLButtonElement | null | undefined = item?.current;
            return currentElement ? SelectField._elementHasFocus(currentElement) : false;
        });

    }

    private _onFocus () {

        if (!this.state.dropdownOpen) {

            this._openDropdown();
            this._delayedMoveToFirstItem();

        } else {
            this._updateCurrentItemFromFocus();
        }

    }

    private _delayedMoveToFirstItem () {

        if (this._openDropdownTimeout) {
            clearTimeout(this._openDropdownTimeout);
        }

        this._openDropdownTimeout = setTimeout(() => {
            if (this.state.dropdownOpen) {
                this._moveCurrentItemTo(0);
            } else {
                LOG.warn(`${this.getIdentifier()}: Warning! Dropdown not open yet.`);
            }
        }, MOVE_TO_ITEM_ON_OPEN_DROPDOWN_TIMEOUT);

    }

    private _onBlur () {

        if (!this.state.dropdownOpen) {
            LOG.debug(`${this.getIdentifier()}:_onBlur: Dropdown not open`);
            return;
        }

        if (this._closeDropdownTimeout) {
            clearTimeout(this._closeDropdownTimeout);
        }

        this._closeDropdownTimeout = setTimeout(() => {

            if (this.state.dropdownOpen) {
                if (!this._inputHasFocus()) {
                    LOG.debug(`${this.getIdentifier()}:_onBlur: Closing dropdown after timeout`);
                    this._closeDropdown();
                } else {
                    LOG.debug(`${this.getIdentifier()}: _onBlur: Select has focus still; not closing dropdown.`);
                }
            } else {
                LOG.debug(`${this.getIdentifier()}: _onBlur: Dropdown is not open anymore`);
            }
        }, CLOSE_DROPDOWN_TIMEOUT_ON_BLUR);

    }

    private _closeDropdown () {

        this.setState({dropdownOpen: false});

        const inputEl = this._inputRef?.current;
        if (inputEl) {
            inputEl.focus();
        }

    }

    private _openDropdown () {
        this.setState({dropdownOpen: true});
    }

    private _onKeyDown (event : React.KeyboardEvent) {

        LOG.debug(`${this.getIdentifier()}: _onKeyDown: Keycode set: `, event?.code);
        switch(event?.code) {

            case 'Enter':
                SelectField._cancelKeyEvent(event);
                return this._onEnter();

            case 'ArrowUp':
                SelectField._cancelKeyEvent(event);
                return this._movePrevItem();

            case 'ArrowDown':
                SelectField._cancelKeyEvent(event);
                return this._moveNextItem();

            case 'Tab':
                return;

            case 'Backspace':
            case 'Escape':
                if (this.state.dropdownOpen) {
                    SelectField._cancelKeyEvent(event);
                    return this._closeDropdown();
                } else {
                    return;
                }

        }

        LOG.debug(`${this.getIdentifier()}: No keycode set: `, event?.code);
        SelectField._cancelKeyEvent(event);

        if (!this.state.dropdownOpen) {
            this._openDropdown();
            this._delayedMoveToFirstItem();
        }

    }

    private _onEnter () {

        if ( this.state.dropdownOpen ) {
            const currentItem = this._getCurrentIndex();
            if (currentItem !== undefined) {
                this._selectItem(currentItem);
            }
        } else {
            this._openDropdown();
            this._delayedMoveToFirstItem();
        }

    }

    private _setButtonFocus (index: number) {

        if (index < this._buttonRefs.length) {
            const el = this._buttonRefs[index]?.current;
            if (el) {
                el.focus();
            } else {
                LOG.warn(`_setButtonFocus: No button element found for index ${index}`);
            }
        } else {
            LOG.warn(`_setButtonFocus: No button ref found for index ${index}`);
        }

    }

    private _openDropdownIfNotOpen () {

        if (!this.state.dropdownOpen) {
            this.setState({
                dropdownOpen: true
            });
        } else {
            LOG.warn(`_openDropdownIfNotOpen: Dropdown was already open`);
        }

    }

    private _moveCurrentItemTo (nextItem: number) {

        const items      : SelectFieldItem<any>[] = this._getValues();
        const totalItems : number                 = items.length;

        if ( !(nextItem >= 0 && nextItem < totalItems) ) {
            LOG.warn(`Could not change to out of range index ${nextItem}`);
            return;
        }

        LOG.debug(`${this.getIdentifier()}: _moveCurrentItemTo: Selecting ${nextItem}`);

        this._setButtonFocus(nextItem);
        this._change(items[nextItem].value);
        this._openDropdownIfNotOpen();

    }

    private _movePrevItem () {

        const items            : SelectFieldItem<any>[] = this._getValues();
        const totalItems       : number                 = items.length;
        const currentItem      : number | undefined     = this._getCurrentIndex();
        const nextItem         : number = currentItem !== undefined ? currentItem - 1 : totalItems - 1;
        const nextCurrentIndex : number = nextItem >= 0             ? nextItem        : totalItems - 1;

        if ( !(nextCurrentIndex >= 0 && nextCurrentIndex < items.length) ) {
            LOG.warn(`${this.getIdentifier()}: _movePrevItem: Could not change to out of range index ${nextCurrentIndex}`);
            return;
        }

        LOG.debug(`${this.getIdentifier()}: _movePrevItem: Selecting ${nextCurrentIndex}`);

        this._setButtonFocus(nextCurrentIndex);
        this._change(items[nextCurrentIndex].value);
        this._openDropdownIfNotOpen();

    }

    private _moveNextItem () {

        const items            : SelectFieldItem<any>[] = this._getValues();
        const totalItems       : number                 = items.length;
        const currentItem      : number | undefined     = this._getCurrentIndex();

        const nextItem         : number = currentItem !== undefined ? currentItem + 1 : 0;
        const nextCurrentIndex : number = nextItem < totalItems ? nextItem : 0;

        if ( !(nextCurrentIndex >= 0 && nextCurrentIndex < items.length) ) {
            LOG.warn(`_moveNextItem: Could not change to out of range index ${nextCurrentIndex}`);
            return;
        }

        const itemValue = items[nextCurrentIndex].value;
        LOG.debug(`${this.getIdentifier()}: _moveNextItem: Selecting ${nextCurrentIndex}: `, itemValue);

        this._change(itemValue);
        this._setButtonFocus(nextCurrentIndex);
        this._openDropdownIfNotOpen();

    }

    private _updateCurrentItemFromFocus () {

        if (!document.hasFocus()) {
            LOG.debug(`${this.getIdentifier()}: _updateCurrentItemFromFocus: Document has no focus`);
            return;
        }

        const items : SelectFieldItem<any>[] = this._getValues();

        const currentItem : number | undefined = this._getCurrentIndex();

        const buttonIndex : number = findIndex(this._buttonRefs, (item: React.RefObject<HTMLButtonElement>) : boolean => {
            const currentElement : HTMLButtonElement | null | undefined = item?.current;
            return currentElement ? SelectField._elementHasFocus(currentElement) : false;
        });

        if (buttonIndex < 0) {
            LOG.debug(`${this.getIdentifier()}: _updateCurrentItemFromFocus: No element found`);
            return;
        }

        if ( currentItem === buttonIndex ) {
            LOG.debug(`${this.getIdentifier()}: _updateCurrentItemFromFocus: Focus already on current item`);
            return;
        }

        if ( !(buttonIndex >= 0 && buttonIndex < items.length) ) {
            LOG.warn(`${this.getIdentifier()}: _updateCurrentItemFromFocus: Could not change to out of range index ${buttonIndex}`);
            return;
        }

        LOG.debug(`${this.getIdentifier()}: _updateCurrentItemFromFocus: Selecting item: `, buttonIndex);

        this._change(items[buttonIndex].value);

    }


    private static _elementHasFocus (el : HTMLInputElement | HTMLButtonElement) : boolean {
        return el.contains(document.activeElement);
    }

    private static _cancelKeyEvent (event : React.KeyboardEvent | React.ChangeEvent) {

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

    }

}

export default SelectField;
