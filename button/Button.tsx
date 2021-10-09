// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import React, {Children} from 'react';
import './Button.scss';
import UserInterfaceClassName from "../constants/UserInterfaceClassName";
import {EventCallback, VoidCallback} from "../../../ts/interfaces/callbacks";

export enum ButtonType {
    DEFAULT = "button",
    RESET   = "reset",
    SUBMIT  = "submit"
}

export interface ButtonState {
}

export interface ButtonClickCallback {
    () : void;
}

export interface ButtonProps {

    readonly className  ?: string;
    readonly type        : ButtonType;
    readonly click       : ButtonClickCallback;
    readonly focus      ?: VoidCallback;
    readonly blur       ?: VoidCallback;
    readonly keyDown    ?: EventCallback<React.KeyboardEvent>;
    readonly buttonRef  ?: React.RefObject<HTMLButtonElement>;
    readonly enabled    ?: boolean;

}

export interface OnClickCallback<T> {
    (event: React.MouseEvent<T>) : void;
}

export class Button extends React.Component<ButtonProps, ButtonState> {

    public static defaultProps : Partial<ButtonProps> = {
        type: ButtonType.DEFAULT
    };

    private readonly _handleClickCallback : OnClickCallback<HTMLButtonElement>;


    public constructor(props: ButtonProps) {

        super(props);

        this.state = {};

        this._handleClickCallback = this._onClick.bind(this);

    }

    public render () {

        const childCount = Children.count(this.props.children);

        const buttonProps : {
            onBlur?: any,
            onFocus?: any,
            onKeyDown?: any,
            ref?: any,
            disabled?: any
        } = {};

        const blurCallback = this.props?.blur;
        if (blurCallback) {
            buttonProps.onBlur = () => blurCallback();
        }

        const focusCallback = this.props?.focus;
        if (focusCallback) {
            buttonProps.onFocus = () => focusCallback();
        }

        const buttonRef = this.props?.buttonRef;
        if (buttonRef) {
            buttonProps.ref = buttonRef;
        }

        const keyDownCallback = this.props?.keyDown;
        if (keyDownCallback) {
            buttonProps.onKeyDown = keyDownCallback;
        }

        const enabled = this.props?.enabled ?? true;
        if (!enabled) {
            buttonProps.disabled = true;
        }

        return (
            <button
                className={
                    UserInterfaceClassName.BUTTON
                    + ` ${UserInterfaceClassName.BUTTON}-count-${childCount}`
                    + ` ${UserInterfaceClassName.BUTTON}-${enabled ? 'enabled' : 'disabled'}`
                    + (this.props.className ? ` ${this.props.className}` : '')
                }
                type={this.props.type}
                onClick={this._handleClickCallback}
                {...buttonProps}
            >{this.props.children}</button>
        );
    }


    private _onClick (event: React.MouseEvent<HTMLButtonElement>) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.props.click) {
            try {
                this.props.click();
            } catch (err) {
                console.error('Error in click callback: ', err);
            }
        }

    }

}

export default Button;
