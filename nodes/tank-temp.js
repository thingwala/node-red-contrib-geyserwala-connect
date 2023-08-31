const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'tank temp', 'tank-temp', Number, false)
}
