"use strict";

// Require Third-party Dependencies
const Config = require("@slimio/config");
const Scheduler = require("@slimio/scheduler");
const timer = require("@slimio/timer");
const is = require("@slimio/is");
const SafeEmitter = require("@slimio/safe-emitter");
const ms = require("ms");

/**
 * @function getSchedulerOption
 * @param {!number} interval
 * @param {string} [startAt]
 * @returns {object}
 */
function getSchedulerOption(interval, startAt) {
    const startDate = typeof startAt === "string" ? startAt : Date.now();
    let intervalUnitType = Scheduler.Types.Seconds;
    if (typeof interval === "string") {
        // eslint-disable-next-line
        interval = ms(interval);
        intervalUnitType = Scheduler.Types.Milliseconds;
    }

    return { interval, intervalUnitType, startDate };
}

/**
 * @async
 * @function profiles
 * @param {!string} configPath
 * @param {Function|null} [predicate]
 * @returns {Promise<void>}
 *
 * @throws {TypeError}
 * @throws {Error}
 */
async function profiles(configPath, predicate = null) {
    if (typeof configPath !== "string") {
        throw new TypeError("configPath must be a string");
    }
    if (predicate !== null && typeof predicate !== "function") {
        throw new TypeError("predicate must be a null or a function");
    }

    // Create and read configuration
    const cfg = new Config(configPath, {
        createOnNoEntry: true,
        autoReload: true,
        writeOnSet: true
    });
    await cfg.read({ profiles: {} });

    // Verify profiles section
    {
        const currProfileValue = cfg.get("profiles");
        const currType = typeof currProfileValue;

        if (currType !== "object" && currType !== "undefined") {
            throw new Error(`configuration profiles section has been detected as: ${currType}`);
        }
        else if (!is.plainObject(currProfileValue)) {
            cfg.set("profiles", {});
        }
    }

    /** @type {Map<string, Profile>} */
    let activeProfiles = new Map();
    let events = new SafeEmitter();

    cfg.observableOf("profiles").subscribe({
        next(currProfiles) {
            const fetched = new Set();
            for (const [name, value] of Object.entries(currProfiles)) {
                const { active = true, interval = 1000, startAt, ...payload } = value;

                if (active) {
                    const timer = new Scheduler(getSchedulerOption(interval, startAt));
                    activeProfiles.set(name, { active, timer, payload });
                    fetched.add(name);
                }
            }

            [...activeProfiles.keys()]
                .filter((name) => !fetched.has(name))
                .forEach((name) => activeProfiles.delete(name));
        },
        error(err) {
            console.error(err);
        }
    });

    const profilesInterval = timer.setInterval(async() => {
        for (const [name, profile] of activeProfiles.entries()) {
            if (!profile.timer.walk()) {
                continue;
            }

            if (predicate !== null && !predicate(name, profile.payload)) {
                continue;
            }
            events.emit("walk", name, profile.payload);
        }
    }, 100);

    return {
        events,
        get(profileName) {
            if (!activeProfiles.has(profileName)) {
                return null;
            }

            return activeProfiles.get(profileName).payload;
        },
        free() {
            timer.clearInterval(profilesInterval);
            activeProfiles = undefined;
            events = undefined;
        }
    };
}

module.exports = profiles;
