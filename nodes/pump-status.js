const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'pump status', 'pump-status', Boolean, false)
}
