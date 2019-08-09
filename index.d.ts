/// <reference types="@slimio/safe-emitter" />

import * as SafeEmitter from "@slimio/safe-emitter";

interface Event<T> {
    walk: (name: string, payload: T) => any;
}

declare function profiles<T>(configPath: string, predicate?: Function) : {
    events: SafeEmitter<Event<T>>;
    get: (profileName: string) => object | null;
    free: () => any;
}

export = profiles;
