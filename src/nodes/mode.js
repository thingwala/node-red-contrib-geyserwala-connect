const value = require('./value.js');

module.exports = function (RED) {
    value.createNode(RED, 'mode', String, true)
}
