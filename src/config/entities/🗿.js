import RenderContainer from '../../components/RenderContainer';
import StateSaver from '../../components/StateSaver';
import {createComponentClass} from 'platypus';
//import EntityController from '../../components/EntityController.js';

const
    SPEED = 0.2,
    Move = createComponentClass({
        publicProperties: {
            x: 0,
            y: 0
        },
        initialize: function () {
            this.x = this.x || (Math.random() * 2000 - 1000);
            this.y = this.y || (Math.random() * 2000 - 1000);
            this.dx = Math.random() * 3 - 1.5;
            this.dy = Math.random() * 3 - 1.5;
        },
        events: {
            "handle-logic": function (tick) {
                const
                    delta = tick.delta;
                
                this.x += this.dx * delta * SPEED;
                this.y += this.dy * delta * SPEED;

                if (this.x > 1300) {
                    this.x = 1300;
                    this.dx = -this.dx;
                } else if (this.x < -1300) {
                    this.x = -1300;
                    this.dx = -this.dx;
                }
                if (this.y > 1300) {
                    this.y = 1300;
                    this.dy = -this.dy;
                } else if (this.y < -1300) {
                    this.y = -1300;
                    this.dy = -this.dy;
                }
            }
        }
    });

export default {
    id: "🗿",
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
        text: "🗿"
    }, StateSaver, Move],
    properties: {
        renderDelay: 0,
        x: 0,
        y: 0,
        z: 3
    }
};