const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'external setpoint', 'external-setpoint', Boolean, true)
}
