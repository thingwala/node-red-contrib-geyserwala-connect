const value = require('./value.js');

module.exports = function (RED) {
    value.createNode(RED, 'external-setpoint', Boolean, true)
}