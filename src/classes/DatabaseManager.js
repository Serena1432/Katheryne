const path = require("path");
const fs = require("fs-extra")

const folderPath = path.resolve(`${__dirname}/../../database`);
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});

var DatabaseManager = {
    folder: folderPath,
    path: function(name) {
        return path.join(this.folder, `${name}.json`);
    },
    get: function(name) {
        try {
            return JSON.parse(fs.readFileSync(this.path(name)).toString());
        }
        catch {
            return {};
        }
    },
    set: function(name, data) {
        fs.writeFileSync(this.path(name), JSON.stringify(data));
    }
};

module.exports = DatabaseManager;