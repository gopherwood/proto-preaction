import {Data, arrayCache, createComponentClass} from 'platypus';

const
    DelayInputs = createComponentClass({
        properties: {
            lifetime: 255
        },
        publicProperties: {
            timestamp: 5
        },
        initialize: function () {
            this.history = [];
            this.goBackInTime = Infinity;
        },
        events: {
            "tick": function () {
                const
                    goBackInTime = this.goBackInTime;

                if (goBackInTime !== Infinity) {
                    this.goBackInTime = Infinity;

                    // Warning: this method will indirectly call "tick" multiple times in the restoration process
                    this.restoreSnapshot(goBackInTime);
                }
            },

            "handle-logic": function (tick) {
                const
                    gameTick = tick.tick;

                this.history.push(Data.setUp(
                    'timestamp', this.timestamp,
                    'entities', this.saveSnapshot(tick),
                    'events', arrayCache.setUp(Data.setUp(//Generate tick for past-future use
                        'timestamp', this.timestamp,
                        'entity', this.owner,
                        'args', arrayCache.setUp('tick', Data.setUp(
                            'delta', tick.delta,
                            'deltaMS', tick.delta,
                            'deltaTime', gameTick.deltaTime,
                            'elapsed', gameTick.elapsed
                        ))
                    ))
                ));

                this.timestamp += tick.delta;

                while (this.history.length > this.lifetime / tick.delta) {
                    const snapshot = this.history.shift();

                    this.discardEntitiesSnapshots(snapshot);
                    this.discardSnapshot(snapshot);
                }
            }
        },
        methods: {
            getSnapshotIndex: function (timestamp) {
                const
                    history = this.history;
                let i = 0,
                    snapshot = history[0];

                while (snapshot && snapshot.timestamp !== timestamp) {
                    i += 1;
                    snapshot = history[i];
                }

                return snapshot ? i : -1;
            }
        },
        publicMethods: {
            discardEntitiesSnapshots: function (snapshot) {
                const
                    entities = snapshot.entities;

                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];

                    if (entity.discardSnapshot) {
                        entity.discardSnapshot(snapshot.timestamp);
                    }
                }
            },
            discardSnapshot: function (snapshot) {
                const
                    events = snapshot.events;

                arrayCache.recycle(snapshot.entities);

                for (let i = 0; i < events.length; i++) {
                    events[i].recycle();
                }
                arrayCache.recycle(events);

                snapshot.recycle();
            },
            restoreSnapshot: function (timestamp) {
                const
                    history = this.history,
                    index = this.getSnapshotIndex(timestamp),
                    snapshot = history[index];

                if (snapshot) {
                    const
                        discardedHistory = arrayCache.setUp(),
                        entities = snapshot.entities;

                    for (let i = index; i < history.length; i++) {
                        discardedHistory.push(history[i]);
                    }
                    history.length = index; // trash everything to come before we go again (and start pushing new items on to our history).

                    // Prepare entities for a little re-run
                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];
    
                        if (entity.restoreSnapshot) {
                            entity.restoreSnapshot(snapshot.timestamp);
                        }
                    }

                    // Now lets try all that again!
                    this.timestamp = timestamp;
                    for (let i = 0; i < discardedHistory.length; i++) {
                        const events = discardedHistory[i].events;

                        for (let j = 0; j < events.length; j++) {
                            const event = events[j];

                            this.owner.triggerHistoricalEvent(0, event.entity, ...event.args);
                        }

                        this.discardSnapshot(discardedHistory[i]);
                    }
                    arrayCache.recycle(discardedHistory);
                }
            },
            saveSnapshot: function (tick) {
                const
                    arr = arrayCache.setUp(),
                    entities = tick.entities;

                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];

                    if (entity.saveSnapshot) {
                        entity.saveSnapshot(this.timestamp);
                        arr.push(entity);
                    }
                }

                return arr;
            },
            triggerHistoricalEvent: function (timestamp = 0, entity = null, ...args) {
                const
                    history = this.history;

                if (!timestamp || timestamp === this.timestamp) {
                    if (args[0] !== 'tick') { // We inject these separately
                        history[history.length - 1].events.push(Data.setUp(
                            'timestamp', timestamp,
                            'entity', entity,
                            'args', args
                        ));
                    }
                    (entity || this.owner).triggerEvent(...args);
                } else {
                    const
                        index = this.getSnapshotIndex(timestamp);

                    if (index > -1) {
                        history[index].events.push(Data.setUp(
                            'timestamp', timestamp,
                            'entity', entity,
                            'args', args
                        ));
                        this.goBackInTime = Math.min(this.goBackInTime, timestamp);
                    }
                }
            }
        }
    });

export default {
    id: "title-scene",
    layers: [{
        id: "title-layer",
        components: [DelayInputs, {
            type: "HandlerController"
        }, {
            type: "HandlerLogic",
            alwaysOn: true
        }, {
            type: "HandlerRender"
        }, {
            type: "Camera",
            width: 1200,
            height: 1200,
            overflow: true
        }, {
            type: "EntityContainer",
            entities: [
                {type: "🤔", properties: {inputDelay: -250, renderDelay: 125, x: -300, y: -300}},
                {type: "🤔", properties: {inputDelay: -250, renderDelay: 75, x: -300, y: 0}},
                {type: "🤔", properties: {inputDelay: -250, renderDelay: 25, x: -300, y: 300}},
                {type: "🤔", properties: {inputDelay: -150, renderDelay: 125, x: 0, y: -300}},
                {type: "🤔", properties: {inputDelay: -150, renderDelay: 75, x: 0, y: 0}},
                {type: "🤔", properties: {inputDelay: -150, renderDelay: 25, x: 0, y: 300}},
                {type: "🤔", properties: {inputDelay: -50, renderDelay: 125, x: 300, y: -300}},
                {type: "🤔", properties: {inputDelay: -50, renderDelay: 75, x: 300, y: 0}},
                {type: "🤔", properties: {inputDelay: -50, renderDelay: 25, x: 300, y: 300}}
            ]
        }]
    }]
};