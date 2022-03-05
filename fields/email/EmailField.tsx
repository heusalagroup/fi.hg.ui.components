// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Component, ChangeEvent } from 'react';
import { UserInterfaceClassName } from "../../constants/UserInterfaceClassName";
import { EmailFieldModel } from "../../types/items/EmailFieldModel";
import { FieldProps } from '../FieldProps';
import { FormFieldState,  stringifyFormFieldState } from "../../types/FormFieldState";
import { LogService } from "../../../../core/LogService";
import { trim } from "../../../../core/modules/lodash";
import { ThemeService } from "../../../services/ThemeService";
import { stringifyStyleScheme } from "../../../services/types/StyleScheme";
import './EmailField.scss';

const LOG = LogService.createLogger('EmailField');
const COMPONENT_CLASS_NAME = UserInterfaceClassName.EMAIL_FIELD;
const COMPONENT_INPUT_TYPE = "email";

export interface EmailFieldState {
    readonly value      : string;
    readonly fieldState : FormFieldState;
}

export interface EmailFieldProps extends FieldProps<EmailFieldModel, string> {

}

export interface OnChangeCallback<T> {
    (event: ChangeEvent<T>): void;
}

export class EmailField extends Component<EmailFieldProps, EmailFieldState> {

    private readonly _handleChangeCallback : OnChangeCallback<HTMLInputElement>;

    private _fieldState : FormFieldState;


    public constructor(props: EmailFieldProps) {
        super(props);
        this._fieldState = FormFieldState.CONSTRUCTED;
        this.state = {
            value: props.value ?? '',
            fieldState: this._fieldState
        };
        this._handleChangeCallback = this._onChange.bind(this);
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
        this._updateValueState();
        this._setFieldState(FormFieldState.MOUNTED);
        this._updateFieldState();
    }

    public componentDidUpdate (
        prevProps: Readonly<EmailFieldProps>,
        prevState: Readonly<EmailFieldState>,
        snapshot?: any
    ) {
        const valueChanged : boolean = prevProps.value !== this.props.value;
        if (valueChanged) {
            this._updateValueState();
        }
        if (valueChanged
            || prevProps.model !== this.props.model
        ) {
            this._updateFieldState();
        }
    }

    public componentWillUnmount (): void {
        this._setFieldState(FormFieldState.UNMOUNTED);
    }

    public render () {

        const label       = this.props.label       ?? this.props.model?.label;
        const placeholder = this.props.placeholder ?? this.props.model?.placeholder;
        const fieldState  = stringifyFormFieldState(this._fieldState);
        const styleScheme = this.props?.style ?? ThemeService.getStyleScheme();

        return (
            <label
                className={
                    `${COMPONENT_CLASS_NAME} ${UserInterfaceClassName.FIELD}`
                    + ' ' + (this.props.className ?? '')
                    + ` ${UserInterfaceClassName.FIELD}-style-${stringifyStyleScheme(styleScheme)}`
                    + ` ${UserInterfaceClassName.FIELD}-state-${fieldState}`
                }
            >
                {label ? (
                    <span className={
                        COMPONENT_CLASS_NAME+'-label'
                        + ` ${UserInterfaceClassName.FIELD}-label`
                    }>{label}</span>
                ) : null}
                <input
                    className={
                        COMPONENT_CLASS_NAME+'-input'
                        + ` ${UserInterfaceClassName.FIELD}-input`
                    }
                    type={COMPONENT_INPUT_TYPE}
                    autoComplete="off"
                    placeholder={placeholder}
                    value={this.state.value}
                    onChange={this._handleChangeCallback}
                    readOnly={ this.props?.change === undefined }
                />
                {this.props.children}
            </label>
        );

    }


    private _setFieldState (value : FormFieldState) {

        this._fieldState = value;

        if ( this.state.fieldState !== value ) {
            this.setState({fieldState: value});
            LOG.debug(`${this.getIdentifier()}: Changed state as `, stringifyFormFieldState(value));
        }

        if ( this.props?.changeState ) {
            this.props.changeState(value);
        }

    }

    private _updateFieldState () {

        LOG.debug(`${this.getIdentifier()}: _updateFieldState: state: `, stringifyFormFieldState(this._fieldState));

        if ( this._fieldState < FormFieldState.MOUNTED ) return;
        if ( this._fieldState >= FormFieldState.UNMOUNTED ) return;

        const isValid = this._validateWithStateValue(
            this.state.value,
            this.props.value,
            this.props?.model?.required ?? false,
            this.props?.model?.minLength ?? 0,
            this.props?.model?.maxLength
        );
        LOG.debug(`${this.getIdentifier()}: _updateFieldState: isValid: `, isValid);

        this._setFieldState( isValid ? FormFieldState.VALID : FormFieldState.INVALID );

    }

    private _validateWithStateValue (
        stateValueString : string,
        propValue        : string | undefined,
        required         : boolean,
        minLength        : number,
        maxLength        : number | undefined
    ) : boolean {

        LOG.debug(`${this.getIdentifier()}: _validateWithStateValue: stateValueString = `, stateValueString);

        if ( !this._validateValue(propValue, required, minLength, maxLength) ) {
            LOG.debug(`${this.getIdentifier()}: _validateWithStateValue: propValue = `, propValue);
            return false;
        }

        const parsedStateValue : string = trim(stateValueString);
        LOG.debug(`${this.getIdentifier()}: _validateWithStateValue: parsedStateValue = `, parsedStateValue);

        if ( parsedStateValue === '' && stateValueString.length >= 1 ) {
            return false;
        }

        if ( !this._validateValue(parsedStateValue, required, minLength, maxLength) ) {
            return false;
        }

        LOG.debug(`${this.getIdentifier()}: _validateWithStateValue: propValue = `, propValue);
        return parsedStateValue === (propValue ?? '');

    }

    private _validateValue (
        internalValue : string | undefined,
        required      : boolean,
        minLength     : number,
        maxLength     : number | undefined
    ) : boolean {

        LOG.debug(`${this.getIdentifier()}: _validateValue: internalValue = `, internalValue);

        if ( internalValue === undefined ) {
            LOG.debug(`${this.getIdentifier()}: _validateValue: required = `, required);
            return !required;
        }

        if (required && minLength === 0) {
            minLength = 1;
        }

        const len = internalValue.length;
        LOG.debug(`${this.getIdentifier()}: _validateValue: len = `, len);
        LOG.debug(`${this.getIdentifier()}: _validateValue: minLength = `, minLength);
        LOG.debug(`${this.getIdentifier()}: _validateValue: maxLength = `, maxLength);

        if ( len < minLength ) return false;
        return !(maxLength !== undefined && len > maxLength);

    }

    private _updateValueState () {
        const value : string = this.props?.value ?? '';
        this._setStateValue(value);
    }

    private _setStateValue (value: string) {
        if ( value !== this.state.value ) {
            this.setState({value}, () => {
                this._updateFieldState();
            });
        }
    }

    private _onChange (event: ChangeEvent<HTMLInputElement>) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const value = event?.target?.value ?? '';

        this._setStateValue(value);

        if (this.props.change) {
            try {
                this.props.change(value);
            } catch (err) {
                LOG.error(`${this.getIdentifier()}: Error: `, err);
            }
        }

    }

}


