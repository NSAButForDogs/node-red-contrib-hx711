module.exports = function(RED) {
    function GetWeight(config) {
        RED.nodes.createNode(this, config);

        this.hx_data = config.hx_data;
        this.hx_sck = config.hx_sck;
        this.hx_scale = config.hx_scale;
        this.hx_gain = config.hx_gain;
        this.hx_offset = config.hx_offset;
        this.hx_avrg = config.hx_avrg;

        const hx711 = require("@shroudedcode/hx711");
        const sensor = new hx711(this.hx_sck, this.hx_data, this.hx_gain);

        // Initialize with default scale
        let scale = this.hx_scale;
        sensor.setScale(scale);

        this.status({ fill: "blue", shape: "dot", text: "ok" });

        const node = this;
        this.on('input', function (msg, send, done) {

            // Check if the message is meant to set the scale
            if (msg.topic === 'scale') {
                scale = parseFloat(msg.payload);  // Update the scale with the payload
                sensor.setScale(scale);           // Set the scale on the sensor instance
                node.status({ fill: "green", shape: "dot", text: "scale set to " + scale });
                if (done) done();                 // Complete if done callback is provided
                return;                           // Exit since this message is only for setting scale
            }

            // If the message is not for scale, proceed with weight measurement
            if (msg.tare) {
                sensor.tare(node.hx_avrg);
            } else {
                msg.payload = sensor.getUnits(node.hx_avrg) - node.hx_offset;

                if (send) {
                    send(msg);
                } else {
                    node.send(msg);
                }
            }

            if (done) {
                done();
            }
        });

    }

    RED.nodes.registerType("hx711", GetWeight);
}
