// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { BACK_LINK_CLASS_NAME } from "../../../constants/hgClassName";
import { useNavigate } from "react-router-dom";
import react, { ReactNode, useCallback } from "react";

export interface BackLinkProps {
    readonly className ?: string;
    readonly children  ?: ReactNode;
}

export function BackLink (props: BackLinkProps) {

    const className = props?.className;
    const navigate = useNavigate();

    const onClick = useCallback(
        (event : react.MouseEvent<HTMLAnchorElement>) => {

            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }

            navigate(-1);

        },
        [
            navigate
        ]
    );

    // FIXME: We could check what was the previous route and provide it as href here
    return (
        <a
            href="/"
            className={
                BACK_LINK_CLASS_NAME
                + (className? ` ${className}` : '')
            }
            onClick={onClick}
        >{props?.children}</a>
    );

}

export default BackLink;
