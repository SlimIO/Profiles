# Profiles
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Profiles/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Profiles/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![size](https://img.shields.io/github/languages/code-size/SlimIO/Profiles)
![dep](https://img.shields.io/david/SlimIO/Profiles)
![known vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/SlimIO/Profiles)
[![Build Status](https://travis-ci.com/SlimIO/Profiles.svg?branch=master)](https://travis-ci.com/SlimIO/Profiles)
[![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/Profiles.svg)](https://greenkeeper.io/)

Addon profiles manager.

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

## Getting Started
This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/profiles
# or
$ yarn add @slimio/profiles
```

## Usage example
```js
import profilesLoader from "@slimio/profiles";
import Addon from "@slimio/addon";

const CPU = new Addon("cpu");
let profiles;

CPU.on("start", async() => {
    profiles = await profilesLoader("./config.json");
    profiles.events.on("walk", (name, payload) => {
        console.log(`profile name => ${name}`);
        console.log(payload);
    });

    await CPU.ready();
});

CPU.on("stop", () => {
    profiles.free(); // use free() to cleanup everything
});

export default CPU;
```

## API
```ts
interface Event<T> {
    walk: (name: string, payload: T) => any;
}

declare function profiles<T>(configPath: string, predicate?: Function) : {
    events: SafeEmitter<Event<T>>;
    get: (profileName: string) => object | null;
    free: () => any;
}
```

> Predicate can be used to filter profiles before calling walk event.

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/config](https://github.com/SlimIO/Config#readme)|Minor|High|TBC|
|[@slimio/is](https://github.com/SlimIO/is)|Minor|Low|Type checker|
|[@slimio/safe-emitter](https://github.com/SlimIO/Safe-emitter)|Minor|Medium|Node.js Safe Emitter|
|[@slimio/scheduler](https://github.com/SlimIO/Scheduler#readme)|Minor|Low|TBC|
|[@slimio/timer](https://github.com/SlimIO/Timer)|Minor|Low|Driftless interval|
|[ms](https://github.com/zeit/ms#readme)|⚠️Major|Low|TBC|

## License
MIT
