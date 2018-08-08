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

		// Initial status
		setStatus(this, false);

		// Read input
		this.on("input", function (msg) {
			if (msg.payload === true || msg.payload === "on") {
				start(this, scanner);
			} else {
				stop(this, scanner);
			}
		});

		// Send message when receive an advertisement
		scanner.onadvertisement = (data) => {
			msg = {};
			msg.topic = this.topic;
			msg.payload = JSON.stringify(data);
			this.send(msg);

			console.log('Sending message payload', msg.payload);
		};

		// Stop scanning on close
		this.on("close", function () {
			stop(this, scanner);
		});
	}

	RED.nodes.registerType("BeaconScanner", BeaconScanner);
}
