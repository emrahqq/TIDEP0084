var awsIot = require('aws-iot-device-sdk');

console.log("starting test");
var certPath = '/home/root/git/s2c-app-code/example/iot-gateway/cloudAdapter/certs/';

var thingShadows = awsIot.thingShadow({
	keyPath: certPath + 'private.pem.key',
	certPath: certPath + 'certificate.pem.crt',
	caPath: certPath + 'root-CA.crt',
	clientId: 'BBBTI3',
	region: 'us-east-1',
	port: 8883,
	host: 'a23op339u3ex9t.iot.us-east-1.amazonaws.com',
	debug: false
});

thingShadows.on('connect', function() {
	console.log('Connected to AWS IoT');
/*	
	var nwkInfoThing = 'ti_iot_0x124b000a27dda1_network';
	thingShadows.register(nwkInfoThing, { ignoreDeltas : true });
	var i = 0;
	setInterval( function() {
		var desired = {};
		if (i === 0) {
			desired = { "state" : "open" };
			i = 1;
		}
		else {
			desired = { "state" : "close" };
			i = 0;
		}
		var token = thingShadows['update'](nwkInfoThing, { state : { desired }}); 
		if (token === null)
			console.log('token is null');
	}, 15000);
*/
	
	var devInfoThing = 'ti_iot_0x124b000a27dda1_0x124b000a27d849';
	thingShadows.register(devInfoThing, { ignoreDeltas : true });
	var i = 0;
	setInterval( function() {
		var desired = { "toggleLED" : "true" };
		var token = thingShadows['update'](devInfoThing, { state : { desired }}); 
		if (token === null)
			console.log('token is null');
	}, 15000);
	
});

thingShadows.on('status', function(thingName, stat, clientToken, stateObject) {
	console.log('AWS Delta Test status'); 
	console.log(thingName + ':\n' + JSON.stringify(stateObject, null, 4));
});
