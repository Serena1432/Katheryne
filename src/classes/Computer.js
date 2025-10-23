var platformPath = {
    "win32": "windows",
    "linux": "linux"
};

var path = platformPath[process.platform];
if (!path) throw new Error("Unsupported platform");

module.exports = require(`./${path}/Computer.js`);