// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import React from 'react';
import './Icon.scss';
import UserInterfaceClassName from "../constants/UserInterfaceClassName";

export enum IconType {

    DEFAULT,
    CIRCLE

}

export interface IconProps {

    className?: string;

    type?: IconType;

}

export interface IconState {

}

export class Icon extends React.Component<IconProps, IconState> {

    static Type = IconType;

    static defaultProps : IconProps = {

        className: undefined,

        type: IconType.DEFAULT

    };

    constructor (props: IconProps) {

        super(props);

        this.state = {};

    }

    public render () {

        return <div className={
            UserInterfaceClassName.ICON +
            ' ' + (this.props.className ?? '') +
            ' ' + Icon.getTypeClassName(this.props.type)
        }>{this.props.children}</div>;

    }

    static getTypeClassName (type : (IconType|undefined)) : string {

        switch (type) {
            case IconType.DEFAULT : return UserInterfaceClassName.ICON + '-type-default';
            case IconType.CIRCLE  : return UserInterfaceClassName.ICON + '-type-circle';
            default:                return '';
        }

    }

}

export default Icon;
