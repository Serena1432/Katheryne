const path = require("path");
const fs = require("fs");
const languageFolder = path.resolve("./src/strings");

module.exports = {
    strings: {},
    languageFile: function(lang) {
        return path.join(languageFolder, `${lang}.json`);
    },
    setLanguage: function(lang) {
        var file = this.languageFile(lang);
        if (!fs.existsSync(file)) throw new Error(`Language ${lang} not found in strings folder`);
        this.strings = JSON.parse(fs.readFileSync(file).toString());
    }
}