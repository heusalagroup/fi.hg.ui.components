// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import FormItemType from "../FormItemType";
import FormFieldModel, { isFormFieldModel } from "../FormFieldModel";
import {
    isArrayOf,
    TestCallback
} from "../../../../ts/modules/lodash";

export interface SelectFieldItem<T> {

    readonly label : string;
    readonly value : T;

}

export interface SelectFieldModel<T> extends FormFieldModel {

    readonly type   : FormItemType.SELECT_FIELD;
    readonly values : SelectFieldItem<T>[];

}

export function isSelectFieldModel<T = any> (
    value  : any,
    isItem : TestCallback | undefined = undefined
) : value is SelectFieldModel<T> {
    return (
        value?.type === FormItemType.SELECT_FIELD
        && isArrayOf<T>(value?.values, isItem)
        && isFormFieldModel(value)
    );
}

export function stringifySelectFieldModel<T = any> (value: SelectFieldModel<T>): string {
    if ( !isSelectFieldModel(value) ) throw new TypeError(`Not SelectFieldModel: ${value}`);
    return `SelectFieldModel(${value})`;
}

/**
 *
 * @param value
 * @fixme No support to parse value items
 */
export function parseSelectFieldModel<T = any> (value: any): SelectFieldModel<T> | undefined {
    if ( isSelectFieldModel<T>(value) ) return value;
    return undefined;
}

export default SelectFieldModel;
