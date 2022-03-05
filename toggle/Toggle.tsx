// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import * as React from "react";
import "./Toggle.scss";
import { ToggleOffIcon, ToggleOnIcon } from "./assets";
import LogService from "../../../core/LogService";
import UserInterfaceClassName from "../constants/UserInterfaceClassName";

const LOG = LogService.createLogger('Toggle');

export interface ToggleChangeCallback {
    (value: boolean) : void;
}

export interface ToggleProps {
    readonly className ?: string;
    readonly value      : boolean;
    readonly change    ?: ToggleChangeCallback;
}

export interface ToggleState {
}

export class Toggle extends React.Component<ToggleProps, ToggleState> {

    private readonly _clickCallback : (e: React.MouseEvent<HTMLDivElement>) => void;

    public static defaultProps: Partial<ToggleProps> = {};

    public constructor (props: ToggleProps) {
        super(props);
        this._clickCallback = this._onClick.bind(this);
    }

    public render () {

        const value = this.props.value;
        const Icon = value ? ToggleOnIcon : ToggleOffIcon;

        return (
            <div className={
                UserInterfaceClassName.TOGGLE
                + ' ' + (this.props.className ?? '')
                + ' ' + UserInterfaceClassName.TOGGLE + (value ? '-enabled' : '-disabled')
            }
            onClick={this._clickCallback}
            ><Icon /></div>
        );

    }

    private _onClick (e: React.MouseEvent<HTMLDivElement>) {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const value = !this.props.value;
        if (this.props.change) {
            try {
                this.props.change(value);
            } catch (err) {
                LOG.error(`Error on click handler: `, err);
            }
        } else {
            LOG.warn(`Warning! No click handler defined!`);
        }

    }

}

export default Toggle;
