
module.exports = function (RED) {
    class Node {
        constructor (config) {
            RED.nodes.createNode(this, config);

            if (config.api == 'MQTT') {
                const GeyserwalaConnectorMqtt = require('./geyserwala-api-mqtt');

                this.api = new GeyserwalaConnectorMqtt(RED,
                    RED.nodes.getNode(config.mqttBroker),
                    config.mqttPubQos,
                    config.mqttRetain,
                    config.mqttTopicTemplate,
                    config.mqttTopicMac,
                    config.mqttTopicIP,
                    config.mqttTopicHostname
                );
            } else if (config.api == "REST") {
                const GeyserwalaConnectorRest = require('./geyserwala-api-rest');

                this.api = new GeyserwalaConnectorRest(RED,
                    config.restHost,
                    config.restPort,
                    config.restUser,
                    config.restPassword,
                    config.restPollInterval,
                )
            }
        }
    }
    RED.nodes.registerType("geyserwala-connect-api", Node);
};
