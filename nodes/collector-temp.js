const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'collector temp', 'collector-temp', Number, false)
}
