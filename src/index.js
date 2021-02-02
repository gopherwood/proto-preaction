/* global require */
import './styles.css';
import {Game} from 'platypus';
import unpack from './spritesheets.js';

const
    packageData = require('../package.json'),
    config = {
        entities: {},
        levels: {},
        spriteSheets: {},
        atlases: {},
        skeletons: {}
    },
    flatten = {
        entities: true,
        scenes: true
    },
    importJS = function (r, config) {
        r.keys().forEach((key) => {
            var arr = key.split('/'),
                last = arr.length - 1,
                file = arr[last],
                lastDot = file.lastIndexOf('.'),
                fileName = file.substring(0, lastDot),
                fileType = file.substring(lastDot + 1).toLowerCase(),
                fullName = '',
                i = 0,
                props = config;
            let result = null;
            
            for (i = 0; i < last; i++) {
                if (arr[i] !== '.') {
                    if (!props[arr[i]]) {
                        props[arr[i]] = {};
                    }

                    props = props[arr[i]];

                    if (flatten[arr[i]]) {
                        for (let j = i + 1; j < arr.length - 1; j++) {
                            fullName += `${arr[j]}-`;
                        }
                        fullName += fileName;
                        break;
                    }
                }
            }

            if (fileType === 'js') {
                result = r(key).default;
            } else if (fileType === 'json') {
                result = r(key);
            }

            // We have a duplicate
            if (props[fileName]) {
                if (Array.isArray(props[fileName])) {
                    props[fileName].push(result);
                } else {
                    props[fileName] = [
                        props[fileName],
                        result
                    ];
                }                
            } else {
                props[fileName] = result;
            }

            if (fullName !== fileName) {
                props[fullName] = result;
            }
        });
    },
    importTEXT = function (r, config) {
        r.keys().forEach((key) => {
            var arr = key.split('/'),
                last = arr.length - 1;
            
            config[arr[last].substring(0, arr[last].length - 6)] = r(key).default;
        });
    };

// Base configuration
importJS(require.context(
    "./config/", // context folder
    true, // include subdirectories
    /.*\.(?:js|json)/ // RegExp
  ), config);

// Sprite Sheets
importJS(require.context(
    "../assets/images/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.spriteSheets);
unpack(config.spriteSheets, 'assets/images/');

// levels
importJS(require.context(
    "../assets/levels/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.levels);

  // spine skeleton files
importJS(require.context(
    "../assets/spine/", // context folder
    true, // include subdirectories
    /.*\.json/ // RegExp
  ), config.skeletons);

// spine atlas files
importTEXT(require.context(
    "../assets/spine/", // context folder
    true, // include subdirectories
    /.*\.atlas/ // RegExp
  ), config.atlases);

const game = new Game(config, {
    canvasId: 'stage',
    display: {
        aspectRatio: "3:7-7:3",
        backgroundColor: 0x101010,
        clearView: true
    },
    audio: 'assets/audio/',
    images: 'assets/images/',
    name: packageData.name,
    version: packageData.version
});

game.loadScene('title-scene');