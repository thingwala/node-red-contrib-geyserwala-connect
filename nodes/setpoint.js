const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'setpoint', 'setpoint', Number, true)
}
