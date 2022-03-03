// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import React from "react";
import { useLocation } from "react-router-dom";

// import LogService from "../../../../nor/ts/LogService";
// const LOG = LogService.createLogger('IfLocation');

export interface IfLocationProps {
    readonly path     ?: string;
    readonly children  : React.ReactNode;
}

/**
 * Render children only if location path matches
 */
export function IfLocation (props: IfLocationProps) {
    const targetPath = props?.path;
    const location = useLocation();
    const currentPath = location?.pathname;
    //LOG.debug(`location: `, targetPath, currentPath);
    return (
        <>{targetPath !== undefined && currentPath === targetPath ? props.children : null}</>
    );
}

export default IfLocation;
