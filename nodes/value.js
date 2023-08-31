module.exports = {
    registerType: function (RED, name, key, type, input) {
        function Node(config) {
            RED.nodes.createNode(this, config);

            var geyserwalaConnector = RED.nodes.getNode(config.geyserwalaConnector)
            if (!geyserwalaConnector) {
                this.error('Connector not configured')
                return
            }
            this.api = geyserwalaConnector.api;
            if (!geyserwalaConnector.api) {
                this.error('Invalid API')
                return
            }

            this.api.registerNode(this)

            this.api.subscribe(key, type, (payload) => {
                try {
                    this.send({ topic: key, payload: payload })
                } catch (error) {
                    console.error(error.message);
                }
            });
            this.on('close', () => {
                this.api.unsubscribe(key);
                this.api.unregister(this);
            });

            if (input) {
                this.on('input', function (message) {
                    try {
                        this.api.send(key, message.payload)
                    } catch (error) {
                        console.error(error.message);
                    }
                })
            }
            this.on('close', function () {
                this.api.unregister(this);
            });
        }

        RED.nodes.registerType(name, Node);
    },
}