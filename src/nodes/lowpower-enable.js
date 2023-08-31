const value = require('./value.js');

module.exports = function (RED) {
    value.createNode(RED, 'lowpower-enable', Boolean, true)
}
