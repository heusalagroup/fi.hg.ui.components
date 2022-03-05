// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { useLayoutEffect } from "react";
import { BrowserOnly } from "../browserOnly/BrowserOnly";
import { LogService } from "../../../../../hg/core/LogService";

const LOG = LogService.createLogger('ScrollToTop');

/**
 * This method would print a warning on SSR React, so we use a useEffect workaround to remove that
 * warning. See the ScrollToTop() below.
 */
function BrowserOnlyScrollToTop () {

    useLayoutEffect(() => {
        LOG.debug(`BrowserOnlyScrollToTop: Scrolling to top`);
        window.scrollTo(0, 0);
    }, []);

    return null;

}

/**
 * Scrolls to top when ever the route changes
 */
export function ScrollToTop () {

    return <BrowserOnly><BrowserOnlyScrollToTop /></BrowserOnly>;

}


