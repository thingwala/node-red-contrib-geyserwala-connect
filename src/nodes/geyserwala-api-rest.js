const http = require('http');

class GeyserwalaConnectorRest {
    constructor(RED, host, port, user, password, pollInterval) {
        this.RED = RED
        this.host = host
        this.port = port
        this.user = user
        this.password = password
        this.req = null;
        this.pollInterval = pollInterval
        this.pollTimer = null;

        this.subscriptions = {}
        this.nodes = []
        this.values = {}
        this.backoff = 0
        this.authToken = null;

        this.startPollingWithBackoff();
    }
    subscribe(key, type, onValue) {
        this.subscriptions[key] = onValue;
    }
    unsubscribe(key) {
        delete this.subscriptions[key];
    }
    registerNode(node) {
        this.nodes.push(node);
    }
    unregisterNode(node) {
        this.nodes = this.nodes.filter((item) => {
            return item !== node;
        })
    }
    status(blob) {
        for (const node of this.nodes) {
            node.status(blob);
        }
    }
    statusOnline(msg) {
        this.status({ fill: "green", shape: "dot", text: msg || "online" });
    }
    statusOffline(msg) {
        this.status({ fill: "red", shape: "ring", text: msg || "offline" });
    }
    updateValues(blob) {
        for (const key in blob) {
            try {
                if (this.values[key] != blob[key]) {
                    this.values[key] = blob[key];
                    this.subscriptions[key](blob[key]);
                }
            }
            catch (error) {
                console.debug('No subscription', key);
            }
        }
    }
    startPolling(interval) {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }
        this.pollTimer = setTimeout(
            () => {
                if (this.password && !this.authToken) {
                    this.auth();
                }
                else {
                    this.poll();
                }
            },
            interval * 1000
        );
    }
    startPollingAfterSuccess() {
        this.backoff = 0;
        this.startPolling(this.pollInterval);
    }
    startPollingWithBackoff() {
        this.backoff ++;
        let interval = Math.min(this.pollInterval * this.backoff, 60);
        this.startPolling(interval);
    }
    stopPolling() {
        if (this.req) {
            this.req.destroy();
            this.req = null;
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }
    auth() {
        this.stopPolling()
        let blob = {username: this.user, password: this.password}
        this.request(
            'POST',
            '/api/session',
            blob,
            (status, blob) => {
                if (status == 200 && blob.success) {
                    this.authToken = blob.token;
                    this.statusOnline('auth success');
                    this.startPollingAfterSuccess();
                    return;
                }
                this.statusOffline('auth failed');
                this.startPollingWithBackoff();
            },
            (error) => {
                this.RED.log.error(`{Geyserwala Connect} Authing: ${error.message}`);
                this.statusOffline(error.message);
                this.startPollingWithBackoff();
            }
        )
    }
    poll() {
        this.stopPolling()
        this.request(
            'GET',
            '/api/value?f=' + Object.keys(this.subscriptions).join(','),
            undefined,
            (status, blob) => {
                if (status == 200) {
                    this.updateValues(blob);
                    this.statusOnline()
                    this.startPollingAfterSuccess();
                    return;
                } else if (status == 401){
                    this.authToken = null;
                    this.statusOffline('access denied')
                }
                else {
                    this.statusOffline()
                }
                this.startPollingWithBackoff();    
            },
            (error) => {
                // this.RED.log.error(`{Geyserwala Connect} Polling: ${error.message}`);
                this.statusOffline(error.message);
                this.startPollingWithBackoff();
            }
        )
    }
    send(key, value) {
        this.stopPolling()
        this.request('PATCH',
            '/api/value',
            { [key]: value },
            (status, blob) => {
                if (status == 200) {
                    this.updateValues(blob)
                    this.statusOnline()
                    this.startPollingAfterSuccess();
                    return
                }
                this.statusOffline()
                this.startPollingWithBackoff();
            },
            (error) => {
                this.RED.log.error(`{Geyserwala Connect} Patching: ${error.message}`);
                this.statusOffline(error.message);
                this.startPollingWithBackoff();
            }
        )
    }
    request(method, path, blob, success, fail) {
        const http = require('http');

        let requestBody = ''
        if (blob) {
            requestBody = JSON.stringify(blob)
        }

        const options = {
            hostname: this.host,
            port: this.port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': requestBody.length
            }
        };
        if (this.authToken) {
            options.headers['Authorization'] = `Bearer ${this.authToken}`
        }

        this.req = http.request(options, (res) => {
            let responseBody = [];

            res.on('data', (chunk) => {
                responseBody.push(chunk);
            });

            res.on('end', () => {
                try {
                    let blob = JSON.parse(Buffer.concat(responseBody).toString());
                    this.req = null
                    success(res.statusCode, blob)
                }
                catch(error) {
                    this.RED.log.error(`{Geyserwala Connect} Request failed: ${error.message}`)
                    fail(error);
                }
            });
        });
        this.req.setTimeout(10000, () => {
            this.req.abort();
            fail({message: "Request timed out"});
        });
        this.req.on('abort', () => {
            // console.debug('Request aborted.');
        });
        this.req.on('error', (error) => {
            this.req = null;
            fail(error);
        });

        this.req.write(requestBody);
        this.req.end();
    }
}

module.exports = GeyserwalaConnectorRest;
