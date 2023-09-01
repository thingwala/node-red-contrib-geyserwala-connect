class GeyserwalaConnectorMqtt {
    constructor(RED, broker, pubQos, retain, template, mac, ip, hostname) {
        this.RED = RED
        this.broker = broker
        this.pubQos = pubQos
        this.retain = retain
        this.template = template.replace('%mac%', mac || 'MAC').replace('%ip%', ip || 'IP').replace('%hostname%', hostname || 'HOSTNAME')
        this.subscriptions = {}
        this.nodes = []

        if (this.broker && !this.broker.client) {
            this.broker.connect(() => {
                this.setupBrokerEvents()
            })
        } else {
            this.setupBrokerEvents();
        }
    }
    setupBrokerEvents() {
        if (this.broker && this.broker.client) {

            this.status({ fill: "green", shape: "dot", text: "connected" });
            for (const topic in this.subscriptions) {
                this.subscribeTopic(topic)
            }
            this.broker.client.on("message", (topic, payload) => {
                try {
                    this.subscriptions[topic](payload)
                } catch (error) {
                    this.RED.log.error(`{Geyserwala Connect} Handling subscription: ${error.message}`);
                }
            });

            this.broker.client.on("reconnect", () => {
                this.status({ fill: "yellow", shape: "ring", text: "reconnecting" });
            });

            this.broker.client.on("offline", () => {
                this.status({ fill: "red", shape: "ring", text: "offline" });
            });

            this.broker.client.on("close", () => {
                this.status({ fill: "red", shape: "ring", text: "disconnected" });
            });

            this.broker.client.on("error", (error) => {
                this.status({ fill: "red", shape: "ring", text: "error" });
                this.RED.log.error(`{Geyserwala Connect} MQTT error: ${error}`);
            });
        } else {
            this.status({ fill: "red", shape: "ring", text: "no broker" });
            this.RED.log.error(`{Geyserwala Connect} No MQTT broker configuration found!`);
        }
    }
    subTopic(key) {
        return this.template.replace('%prefix%', 'stat') + `/${key}`;
    }
    pubTopic(key) {
        return this.template.replace('%prefix%', 'cmnd') + `/${key}`;
    }
    subscribeTopic(topic) {
        this.broker.client.subscribe(topic, (err) => {
            if (err) {
                this.RED.log.error(`{Geyserwala Connect} Subscribing to topic: ${topic}: ${err}`);
            }
        });
    }
    subscribe(key, type, onValue) {
        let topic = this.subTopic(key)
        this.subscriptions[topic] = (payload) => {
            let msg = payload.toString()
            let value
            if (type === Number) {
                value = parseInt(msg)
            } else if (type === Boolean) {
                value = msg == 'ON'
            } else {
                value = String(msg)
            }
            onValue(value)
        }

        if (this.broker && this.broker.client) {
            this.subscribeTopic(topic)
        }
    }
    unsubscribe(key) {
        let topic = this.subTopic(key)

        delete this.subscriptions[topic]
        this.broker.client.unsubscribe(topic)
    }
    registerNode(node) {
        this.nodes.push(node)
    }
    unregisterNode(node) {
        this.nodes = this.nodes.filter((item) => {
            return item !== node
        })
    }
    status(blob) {
        for (const node of this.nodes) {
            node.status(blob)
        }
    }
    send(key, value) {
        let payload
        if (typeof value === 'boolean') {
            payload = value ? "ON" : "OFF"
        } else {
            payload = String(value)
        }
        const options = {
            qos: this.pubQos,
            retain: this.retain,
        };
        this.broker.client.publish(this.pubTopic(key), payload, options, (err) => {
            if (err) {
                this.RED.log.error(`{Geyserwala Connect} Publishing to MQTT: ${err}`);
            }
        });
    }
}

module.exports = GeyserwalaConnectorMqtt;
