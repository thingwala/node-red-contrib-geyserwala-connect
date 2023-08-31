const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'external demand', 'external-demand', Boolean, true)
}
