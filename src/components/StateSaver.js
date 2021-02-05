import {Data, arrayCache, createComponentClass} from 'platypus';

const
    deepCycle = (a) => {
        if (Array.isArray(a)) {
            for (let i = 0; i < a.length; i++) {
                deepCycle(a[i]);
            }
            arrayCache.recycle(a);
        } else if (a instanceof Data) {
            for (const key in a) {
                if (a.hasOwnProperty(key)) {
                    deepCycle(a[key]);
                }
            }
            a.recycle();
        }
    };

export default createComponentClass({
    properties: {
        saveProperties: [
            'x',
            'y'
        ]
    },
    publicProperties: {
        inputDelay: 0,
        renderDelay: 0
    },
    initialize: function () {
        const
            saveProperties = this.saveProperties;

        // Create editable version of saveProperties
        this.saveProperties = arrayCache.setUp();
        if (Array.isArray(saveProperties)) {
            for (let i = 0; i < saveProperties.length; i++) {
                const
                    saveProperty = saveProperties[i];

                if (Array.isArray(saveProperty)) {
                    this.saveProperties.push(saveProperty);
                } else {
                    this.saveProperties.push(saveProperty.split('.'));
                }
            }
        }
        this.snapshots = Data.setUp();
    },
    events: {
    },
    methods: {
        updateProperties: function (fromObj, toObj) {
            const saveProperties = this.saveProperties;

            for (let i = 0; i < saveProperties.length; i++) {
                const depth = saveProperties[i];
                let fromDeeperObj = fromObj,
                    toDeeperObj = toObj,
                    key = depth[0];

                for (let j = 1; j < depth.length; j++) {
                    fromDeeperObj = fromDeeperObj[key];
                    if (!toDeeperObj[key]) { //TODO: Probably need to add support for arrays and such.
                        toDeeperObj[key] = Data.setUp();
                    }
                    toDeeperObj = toDeeperObj[key];
                    key = depth[j];
                }
                toDeeperObj[key] = fromDeeperObj[key];
            }

            return toObj;
        }
    },
    publicMethods: {
        discardSnapshot: function (timestamp) {
            deepCycle(this.snapshots[timestamp]);
            delete this.snapshots[timestamp];
        },
        restoreSnapshot: function (timestamp) {
            const snapshot = this.snapshots[timestamp];

            if (snapshot) {
                this.updateProperties(snapshot, this.owner);
                this.owner.triggerEvent('rewind');
                return this.owner;
            } else {
                return null;
            }
        },
        saveSnapshot: function (timestamp) {
            const snapshot = this.snapshots[timestamp] = this.updateProperties(this.owner, this.snapshots[timestamp] || Data.setUp());

            return snapshot;
        },
        triggerHistoricalEvent: function (timestamp, ...args) {
            this.owner.parent.triggerHistoricalEvent(timestamp, this.owner, ...args);
        }
    }
});