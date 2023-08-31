module.exports = {
    createNode: function (RED, valueKey, type, input) {
        function Node(config) {
            RED.nodes.createNode(this, config);

            var geyserwalaApi = RED.nodes.getNode(config.geyserwalaApi)
            if (!geyserwalaApi) {
                this.error('Connector not configured')
                return
            }
            this.api = geyserwalaApi.api;
            if (!geyserwalaApi.api) {
                this.error('Invalid API')
                return
            }

            this.api.registerNode(this)

            this.api.subscribe(valueKey, type, (payload) => {
                try {
                    this.send({ topic: valueKey, payload: payload })
                } catch (error) {
                    console.error(error.message);
                }
            });
            this.on('close', () => {
                this.api.unsubscribe(valueKey);
                this.api.unregister(this);
            });

            if (input) {
                this.on('input', function (message) {
                    try {
                        this.api.send(valueKey, message.payload)
                    } catch (error) {
                        console.error(error.message);
                    }
                })
            }
            this.on('close', function () {
                this.api.unregister(this);
            });
        }

        RED.nodes.registerType(`geyserwala-connect-${valueKey}`, Node);
    }
}
