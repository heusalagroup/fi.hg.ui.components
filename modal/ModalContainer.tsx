// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import * as React from "react";
import "./ModalContainer.scss";
import UserInterfaceClassName from "../constants/UserInterfaceClassName";
import Modal from "../../services/types/Modal";
import ModalService from "../../services/ModalService";
import { stringifyModalType } from "../../services/types/ModalType";
import { ChangeCallback, EventCallback, VoidCallback } from "../../../ts/interfaces/callbacks";
import LogService from "../../../ts/LogService";

const LOG = LogService.createLogger('ModalContainer');

export interface ModalContainerProps {

    readonly className ?: string;
    readonly modal      : Modal;
    readonly close     ?: ChangeCallback<Modal>;

}

export interface ModalContainerState {
}

export class ModalContainer extends React.Component<ModalContainerProps, ModalContainerState> {

    public static defaultProps: Partial<ModalContainerProps> = {};

    private readonly _closeModalCallback  : VoidCallback;
    private readonly _modalClickCallback  : EventCallback<React.MouseEvent<HTMLDivElement>>;

    public constructor (props: ModalContainerProps) {

        super(props);

        this.state = {};

        this._closeModalCallback  = this._onCloseModal.bind(this);
        this._modalClickCallback  = this._onModalClick.bind(this);

    }

    public render () {

        const modal = this.props.modal;
        if (!modal) {
            LOG.debug(`render: No modal detected`);
            return null;
        }

        LOG.debug(`render: modal =`, modal);

        const component  = modal.getComponent();
        const type       = modal.getType();
        const hasOverlay = modal.isOverlayEnabled();

        const containerProps : {onClick?: VoidCallback} = {};
        if (hasOverlay) {
            containerProps.onClick = this._closeModalCallback;
        }

        return (
            <div
                className={
                    UserInterfaceClassName.MODAL_CONTAINER
                    + ' ' + (this.props.className ?? '')
                    + ' ' + UserInterfaceClassName.MODAL_CONTAINER + '-type-' + (stringifyModalType(type))
                    + ' ' + UserInterfaceClassName.MODAL_CONTAINER + '-overlay-' + (hasOverlay ? 'enabled' : 'disabled')
                }
                {...containerProps}
            >
                <div className={UserInterfaceClassName.MODAL_CONTAINER + '-content'}
                     onClick={this._modalClickCallback}
                >{component}</div>
            </div>
        );

    }


    private _onCloseModal () {

        if (this.props?.close) {

            try {
                this.props.close(this.props.modal);
            } catch (err) {
                LOG.error(`_onCloseModal: Could not close modal: `, err);
            }

        } else {

            const modal = this.props.modal;
            if (modal !== undefined) {
                LOG.debug(`_onCloseModal: closing modal: modal =`, modal);
                ModalService.removeModal(modal);
            } else {
                LOG.debug(`_onCloseModal: no modal detected`);
            }

        }

    }

    private _onModalClick (event : React.MouseEvent<HTMLDivElement>) {

        if (event) {
            LOG.debug(`_modalClickCallback: default click action cancelled`);
            event.stopPropagation();
            event.preventDefault();
        } else {
            LOG.debug(`_modalClickCallback: click detected`);
        }

    }

}

export default ModalContainer;
