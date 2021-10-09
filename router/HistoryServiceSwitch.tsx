// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Switch, useHistory } from "react-router-dom";
import * as React from "react";
import { useEffect } from "react";
import RouteService, { RouteServiceEvent } from "../../services/RouteService";

/**
 * Enables `RouteService.setRoute()` functionality with react-router-dom's switch.
 *
 * @param props
 * @constructor
 */
export function HistoryServiceSwitch (props: {children: any}): any {

    const history = useHistory();

    useEffect(() => {

        const prevRoute = RouteService.getNextHistory();

        if ( prevRoute ) {
            history.push(prevRoute);
        }

        return RouteService.on(
            RouteServiceEvent.PUSH_HISTORY,
            (
                eventName,
                routeName: string
            ) => {
                history.push(routeName);
            }
        );

    }, [ history ]);

    return (
        <Switch>{props.children}</Switch>
    );

}

export default HistoryServiceSwitch;
