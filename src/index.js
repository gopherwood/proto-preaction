/* global require */
import './styles.css';
import platypus from 'platypus';

const packageData = require('../package.json'),
    config = {
        levels: {},
        spriteSheets: {}
    },
    flatten = {
        entities: true,
        scenes: true
    },
    importComponents = function (r) {
        r.keys().forEach((key) => {
            var arr = key.split('/'),
                last = arr.length - 1;

            platypus.components[arr[last].substring(0, arr[last].length - 3)] = r(key).default;
        });
    },
    importJSON = function (r, config) {
        r.keys().forEach((key) => {
            var arr = key.split('/'),
                i = 0,
                props = config,
                last = arr.length - 1;

            for (i = 0; i < last; i++) {
                if (arr[i] !== '.') {
                    if (!props[arr[i]]) {
                        props[arr[i]] = {};
                    }

                    props = props[arr[i]];

                    if (flatten[arr[i]]) {
                        break;
                    }
                }
            }
            props[arr[last].replace('.json', '')] = r(key);
        });
    };

importComponents(require.context(
    "./components/", // context folder
    true, // include subdirectories
    /.*\.js/ // RegExp
));

// Base configuration
importJSON(require.context(
    "./config/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
), config);

// Sprite Sheets
importJSON(require.context(
    "../assets/images/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
), config.spriteSheets);

// levels
importJSON(require.context(
    "../assets/levels/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
), config.levels);

//standardizeLevelPoints(config.levels);

const game = new platypus.Game(config, {
    canvasId: 'stage',
    display: {
        clearView: true
    },
    audio: 'assets/audio/',
    images: 'assets/images/',
    name: packageData.name,
    version: packageData.version
});

game.loadScene('title-scene');