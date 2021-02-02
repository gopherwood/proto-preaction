import EntityController from '../../components/EntityController.js';
import {createComponentClass} from 'platypus';

const
    SPEED = 0.2,
    Move = createComponentClass({
        properties: {
            east: 0,
            north: 0,
            south: 0,
            west: 0
        },
        publicProperties: {
            inputDelay: 0,
            renderDelay: 0,
            x: 0,
            y: 0
        },
        initialize: function () {
            this.owner.triggerEvent('set-label', {
                text: `Input: ${this.inputDelay}ms\nRender: ${this.renderDelay}ms`
            });
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
            }
        }
    });

export default {
    id: "🤔",
    components: [EntityController, {
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
            ArrowRight: "east",
            ArrowDown: "south",
            ArrowLeft: "west",
            ArrowUp: "north",
            RightDPad: "east",
            DownDPad: "south",
            LeftDPad: "west",
            UpDPad: "north"
        },
        x: 0,
        y: 0,
        z: 2
    }
};