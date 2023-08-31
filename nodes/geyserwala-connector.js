
module.exports = function (RED) {
    function Node(config) {
        RED.nodes.createNode(this, config);

        if (config.api == 'MQTT') {
            const GeyserwalaConnectorMqtt = require('./geyserwala-connector-mqtt');

            this.api = new GeyserwalaConnectorMqtt(
                RED.nodes.getNode(config.mqttBroker),
                config.mqttTopicTemplate,
                config.mqttTopicMac,
                config.mqttTopicIP,
                config.mqttTopicHostname
            );
        } else if (config.api == "REST") {
            const GeyserwalaConnectorRest = require('./geyserwala-connector-rest');

            this.api = new GeyserwalaConnectorRest(
                config.restHost,
                config.restPort,
                config.restUser,
                config.restPassword,
                config.restPollInterval,
            )
        }
    }
    RED.nodes.registerType("geyserwala-connector", Node);
};
