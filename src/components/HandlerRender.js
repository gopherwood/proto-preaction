/**
 * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
 *
 * @namespace platypus.components
 * @class HandlerRender
 * @uses platypus.Component
 */
/* global platypus */
import {Data, Interactive, createComponentClass} from 'platypus';
import {Container} from 'pixi.js';

export default (function () {
    return createComponentClass({

        id: "HandlerRender",

        properties: {
            /**
             * Defines whether the entity will respond to touch and click events. Setting this value will create an Interactive component on this entity with these properties. For example:
             *
             *  "interactive": {
             *      "hover": false,
             *      "hitArea": {
             *          "x": 10,
             *          "y": 10,
             *          "width": 40,
             *          "height": 40
             *      }
             *  }
             *
             * @property interactive
             * @type Boolean|Object
             * @default false
             */
            interactive: false
        },

        publicProperties: {
            /**
             * This is the container holding all children's disply objects for this layer. It's an available property on the layer entity.
             *
             * @property worldContainer
             * @type PIXI.Container
             * @default null
             */
            worldContainer: null,
        },

        initialize: function () {
            let definition = null;
            
            this.worldContainer = this.worldContainer || new Container();
            this.worldContainer.sortableChildren = true;
            this.worldContainer.name = '';

            if (this.interactive) {
                definition = Data.setUp(
                    'container', this.worldContainer,
                    'hitArea', this.interactive.hitArea,
                    'hover', this.interactive.hover,
                    'relativeToSelf', true
                );
                this.owner.addComponent(new Interactive(this.owner, definition));
                definition.recycle();
            }

            this.renderMessage = Data.setUp(
                'delta', 0,
                'container', this.worldContainer,
                'tick', null
            );
        },

        events: {
            /**
             * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
             *
             * @method 'load'
             */
            "load": function () {
                /**
                 * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
                 *
                 * @event 'render-world'
                 * @param data {Object}
                 * @param data.world {PIXI.Container} Contains entities to be rendered.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.worldContainer
                });

                /**
                 * This event is triggered once HandlerRender is ready to handle interactivity.
                 *
                 * @event 'input-on'
                 */
                this.owner.triggerEvent('input-on');
            },

            /**
             * Called when a new entity has been added to the parent and should be considered for addition to the handler. Entities are sent a reference the Container that we're rendering to, so they can add their display objects to it and the delta from the lastest tick.
             *
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} The entity added to the parent.
             */
            "child-entity-added": function (entity) {
                if (entity.container) {
                    this.setParentRenderContainer(entity, entity.renderParent);
                }
                
                /**
                 * Triggered on an entity added to the parent.
                 *
                 * @event 'handle-render-load'
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 */
                entity.triggerEvent('handle-render-load', this.renderMessage);
            },

            /**
             * Pauses the children of this render Container. If a pause time is not provided. It remains paused until 'unpause-render' is called.
             *
             * @method 'pause-render'
             * @param [data] {Object}
             * @param data.time {Number} How long to pause.
             */
            "pause-render": function (timeData) {
                if (timeData && timeData.time) {
                    this.paused = timeData.time;
                } else {
                    this.paused = -1;
                }
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that rendering updates have been paused.
                     *
                     * @event 'render-paused'
                     */
                    this.owner.triggerEventOnChildren('render-paused');
                }
            },

            /**
             * Unpauses the children of this render Container.
             *
             * @method 'unpause-render'
             */
            "unpause-render": function () {
                this.paused = 0;
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that rendering updates have been unpaused.
                     *
                     * @event 'render-unpaused'
                     */
                    this.owner.triggerEventOnChildren('render-unpaused');
                }
            },

            /**
             * Sends a 'handle-render' message to all the children in the Container. The children in the Container are also paused/unpaused if needed and sorted according to their z value.
             *
             * @method 'tick'
             * @param tick {Object} An object containing tick data.
             */
            "tick": function (tick) {
                if (this.paused > 0) {
                    this.paused -= tick.delta;
                    if (this.paused <= 0) {
                        this.paused = 0;
                    }
                }

                if (!this.paused) {
                    this.renderUpdate(tick);
                }
            },

            /**
             * Sends a 'handle-render' message to all the children in the Container. This bypasses a render pause value and is useful for resizes happening outside the game loop.
             *
             * @method 'render-update'
             * @param tick {Object} An object containing tick data.
             */
            "render-update": function (tick) {
                this.renderUpdate(tick);
            },

            /**
             * Sets the parent render container of an entity to that of the given entity or entity with the given id.
             *
             * @method 'set-parent-render-container'
             * @param entity {Object} The entity to relocate.
             * @param container {Entity|String|PIXI.Container} The entity, id of the entity, or PIXI.Container that will act as the parent container.
             */
            "set-parent-render-container": function (entity, container) {
                this.setParentRenderContainer(entity, container);
            }

        },
        methods: {
            renderUpdate: function (tick) {
                const message = this.renderMessage;

                message.delta = (tick && tick.delta) || 0;
                message.tick = tick;

                /**
                 * Triggered every tick on owner and its children entities.
                 *
                 * @event 'handle-render'
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 */
                this.owner.triggerEvent('handle-render', message);

                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('handle-render', message);
                }
            },

            setParentRenderContainer: function (entity, newContainer) {
                let container = null;

                entity.removeFromParentContainer();

                if (!newContainer) {
                    container = this.worldContainer;

                } else if (typeof newContainer === "string") {

                    const otherEntity = this.owner.getEntityById(newContainer);
                    if (otherEntity) {
                        container = otherEntity.container;
                    } else {
                        //Didn't find group.
                        platypus.debug.warn("Trying to add to non-existent entity, added to World container instead.");
                        container = this.worldContainer;
                    }
                } else if (newContainer instanceof Container) {
                    container = newContainer;
                } else {
                    container = newContainer.container;
                }

                entity.addToParentContainer(container);

            },
            destroy: function () {
                this.worldContainer = null;
                this.renderMessage.recycle();
                this.renderMessage = null;
            }
        }
    });
}());
