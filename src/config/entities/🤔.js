import {Data, createComponentClass} from 'platypus';
import RenderContainer from '../../components/RenderContainer';
import StateSaver from '../../components/StateSaver';
//import EntityController from '../../components/EntityController.js';

const
    SPEED = 0.2,
    Move = createComponentClass({
        publicProperties: {
            inputDelay: 0,
            renderDelay: 0,
            colliding: false,
            hits: 0,
            east: 0,
            north: 0,
            south: 0,
            west: 0,
            x: 0,
            y: 0
        },
        initialize: function () {
            this.updateTitle();
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
            },
            "rewind": function () {
                this.updateTitle();
                if (this.colliding) {
                    this.owner.triggerEvent('set-collision-state', {text: '😝'});
                } else {
                    this.owner.triggerEvent('set-collision-state', {text: '🤔'});
                }
            }
        },
        methods: {
            updateTitle: function () {
                this.owner.triggerEvent('set-label', {
                    text: `Input: ${this.inputDelay}ms\nRender: ${this.renderDelay}ms\nHits: ${this.hits}`
                });
            }
        },
        publicMethods: {
            updateCollision: function (hit) {
                const owner = this.owner;

                if (hit && !this.colliding) {
                    owner.triggerEvent('set-collision-state', {text: '😝'});
                    this.colliding = true;
                    this.hits += 1;
                    this.updateTitle();
                } else if (!hit && this.colliding) {
                    owner.triggerEvent('set-collision-state', {text: '🤔'});
                    this.colliding = false;
                    this.updateTitle();
                }
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
        text: "🤔",
        aliases: {
            "set-collision-state": "set-text"
        }
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
    }, StateSaver, Move],
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
        saveProperties: [
            'colliding',
            'hits',
            'east',
            'north',
            'south',
            'west',
            'x',
            'y'
        ],
        x: 0,
        y: 0,
        z: 2
    }
};