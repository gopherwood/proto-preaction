import {Data, arrayCache, createComponentClass} from 'platypus';
import RenderContainer from '../../components/RenderContainer';
//import EntityController from '../../components/EntityController.js';

const
    SPEED = 0.2,
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
    },
    Move = createComponentClass({
        properties: {
            saveProperties: [
                'east',
                'north',
                'south',
                'west',
                'x',
                'y'
            ]
        },
        publicProperties: {
            inputDelay: 0,
            renderDelay: 0,
            east: 0,
            north: 0,
            south: 0,
            west: 0,
            x: 0,
            y: 0
        },
        initialize: function () {
            const
                saveProperties = this.saveProperties;

            this.owner.triggerEvent('set-label', {
                text: `Input: ${this.inputDelay}ms\nRender: ${this.renderDelay}ms`
            });

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
            "handle-logic": function (tick) {
                const
                    delta = tick.delta;
                
                this.x += (this.east - this.west) * delta * SPEED;
                this.y += (this.south - this.north) * delta * SPEED;
            },
            "east": function (event) {
                this.east = event.pressed ? 1 : 0;
            },
            "north": function (event) {
                this.north = event.pressed ? 1 : 0;
            },
            "south": function (event) {
                this.south = event.pressed ? 1 : 0;
            },
            "west": function (event) {
                this.west = event.pressed ? 1 : 0;
            },
            "delay-east": function (event) {
                if (event.triggered || event.released) {
                    this.owner.triggerHistoricalEvent(this.owner.parent.timestamp + this.inputDelay, "east", Data.setUp(
                        'pressed', event.pressed,
                        'released', event.released,
                        'triggered', event.triggered
                    ));
                }
            },
            "delay-north": function (event) {
                if (event.triggered || event.released) {
                    this.owner.triggerHistoricalEvent(this.owner.parent.timestamp + this.inputDelay, "north", Data.setUp(
                        'pressed', event.pressed,
                        'released', event.released,
                        'triggered', event.triggered
                    ));
                }
            },
            "delay-south": function (event) {
                if (event.triggered || event.released) {
                    this.owner.triggerHistoricalEvent(this.owner.parent.timestamp + this.inputDelay, "south", Data.setUp(
                        'pressed', event.pressed,
                        'released', event.released,
                        'triggered', event.triggered
                    ));
                }
            },
            "delay-west": function (event) {
                if (event.triggered || event.released) {
                    this.owner.triggerHistoricalEvent(this.owner.parent.timestamp + this.inputDelay, "west", Data.setUp(
                        'pressed', event.pressed,
                        'released', event.released,
                        'triggered', event.triggered
                    ));
                }
            }
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
                    return this.updateProperties(snapshot, this.owner);
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

export default {
    id: "🤔",
    components: [{
        type: "EntityController"
    }, {
        type: RenderContainer
    }, {
        type: "RenderText",
        style: {
            fontSize: "48px",
            align: "center",
            verticalAlign: "center"
        },
        text: "🤔"
    }, {
        type: "RenderText",
        style: {
            fontSize: "12px",
            align: "center",
            verticalAlign: "center",
            fill: '#FFC83D',
            fontWeight: "bold"
        },
        offsetY: 48,
        aliases: {
            "set-label": "set-text"
        }
    }, Move],
    properties: {
        controlMap: {
            ArrowRight: "delay-east",
            ArrowDown: "delay-south",
            ArrowLeft: "delay-west",
            ArrowUp: "delay-north",
            RightDPad: "delay-east",
            DownDPad: "delay-south",
            LeftDPad: "delay-west",
            UpDPad: "delay-north"
        },
        x: 0,
        y: 0,
        z: 2
    }
};