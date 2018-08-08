module.exports = function (RED) {
	const BS = require('node-beacon-scanner');
	const scanner = new BS();

	let setStatus = (node, scanning, error) => {
		node.status({
			fill: scanning ? "blue" : error ? "red" : "gray",
			shape: "dot",
			text: scanning ? "scanning" : error ? "error" : "stopped"
		});
	};

	let start = (node, scanner) => {
		scanner.startScan().then(() => {
			setStatus(node, true)
			console.log('Scanner started');
		}).catch((error) => {
			setStatus(node, false, error);
			console.error('Error starting scanner', JSON.stringify(error));
		});
	};

	let stop = (node, scanner) => {
		scanner.stopScan().then(() => {
			setStatus(node, false)
			console.log('Scanner stopped');
		}).catch((error) => {
			setStatus(node, false, error);
			console.error('Error stopping scanner', JSON.stringify(error));
		});
	}

	function BeaconScanner(n) {
		RED.nodes.createNode(this, n);

		var msg = {};
		var node = this;

		// Status icon
		this.status({
			fill: "grey",
			shape: "dot",
			text: "not scanning"
		});

		this.on("input", function (msg) {
			if (msg.payload === true || msg.payload === "on") {
				start(node, scanner);
			} else {
				stop(node, scanner);
			}
		});

		scanner.onadvertisement = (ad) => {
			msg = {};
			msg.topic = node.topic;
			msg.payload = JSON.stringify(ad);
			node.send(msg);

			console.log('Sending message payload', msg.payload);
		};

		this.on("close", function () {
			stop(node, scanner);
		});
	}

	RED.nodes.registerType("BeaconScanner", BeaconScanner);
}
