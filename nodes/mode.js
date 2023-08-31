const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'mode', 'mode', String, true)
}
