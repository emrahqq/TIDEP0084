/******************************************************************************

 @file device.js

 @brief device specific functions

 Group: WCS LPC
 $Target Devices: Linux: AM335x, Embedded Devices: CC1310, CC1350$

 ******************************************************************************
 $License: BSD3 2016 $
  
   Copyright (c) 2015, Texas Instruments Incorporated
   All rights reserved.
  
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
  
   *  Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
  
   *  Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
  
   *  Neither the name of Texas Instruments Incorporated nor the names of
      its contributors may be used to endorse or promote products derived
      from this software without specific prior written permission.
  
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
   THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
   OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
   WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
   OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
   EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************
 $Release Name: TI-15.4Stack Linux x64 SDK$
 $Release Date: July 14, 2016 (2.00.00.30)$
 *****************************************************************************/

/********************************************************************
 * Variables
 * *****************************************************************/
var protobuf = require("protocol-buffers");
var fs = require("fs");
/* set-up to decode/encode proto messages */
var dtimac_pb = protobuf(fs.readFileSync('appClient/protofiles/appsrv.proto'));
var SmartObject = require('smartobject');

/*!
 * @brief      Constructor for device objects
 *
 * @param      shortAddress - 16 bit address of the device
 * 			   extAddress - 64 bit IEEE address of the device
 * 			   capabilityInfo - device capability information
 *
 * @return     device object
 */
function Device(shortAddress, extAddress, capabilityInfo) {
    var devInfo = this;
    devInfo.shortAddress = shortAddress;
    devInfo.extAddress = extAddress;
    devInfo.capabilityInfo = capabilityInfo;
    devInfo.active = 'true';
    devInfo.so = new SmartObject();
    return devInfo;
}

function updateSensor(so, type, instance, value, units) {
	/* Sensor already exists, update its values */
	if (so.has(type, instance)) {
		so.write(type, instance, 'sensorValue', value, function (err, data) { });
		if (value < so.get(type, instance, 'minMeaValue'))
			so.write(type, instance, 'minMeaValue', value, function (err, data) { });
		if (value > so.get(type, instance, 'maxMeaValue'))
			so.write(type, instance, 'maxMeaValue', value, function (err, data) { });
	}
	/* Need to initialize the sensor */
	else {
		so.init(type, instance, {
			"sensorValue" : value,
			"units" : units,
			"minMeaValue" : value,
			"maxMeaValue" : value
		});
	}
}

function updateXYZSensor(so, type, instance, x, y, z, units) {
	/* Sensor already exists, update its values */
	if (so.has(type, instance)) {
		so.write(type, instance, 'xValue', x, function (err, data) { });
		so.write(type, instance, 'yValue', y, function (err, data) { });
		so.write(type, instance, 'zValue', z, function (err, data) { });
		so.write(type, instance, 'units', units, function (err, data) { });
	}
	/* Need to initialize the sensor */
	else {
		so.init(type, instance, {
			"xValue" : x,
			"yValue" : y,
			"zValue" : z,
			"units" : units
		});
	}
}

function updateDigInSensor(so, type, instance, state, desc){
	/* Sensor already exists, update its values */
	if (so.has(type, instance)) {
		so.write(type, instance, 'dInState', state, function (err, data) { });
		so.write(type, instance, 'sensorType', desc, function (err, data) { });
	}
	/* Need to initialize the sensor */
	else {
		so.init(type, instance, {
			"dInState" : state,
			"sensorType" : desc
		});
	}
}	

/* Prototype Functions */
Device.prototype.rxSensorData = function (sensorData) {
    /* received message from the device, set as active */
    this.active = 'true';
	/* Check the support sensor Types and
	add information elements for those */
    if (sensorData.sDataMsg.frameControl &
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_tempSensor) {
       
        /* update the sensor values */
        this.temperaturesensor = {
            ambienceTemp: sensorData.sDataMsg.tempSensor.ambienceTemp,
            objectTemp: sensorData.sDataMsg.tempSensor.objectTemp
        };

        // create/upate ambience temp data
        updateSensor(this.so, 'temperature', 0, sensorData.sDataMsg.tempSensor.ambienceTemp, 'Cels');
        

	// create/update object temp data
        // enable the line below to send the object temp to the cloud
	//updateSensor(this.so, 'temperature', 1, sensorData.sDataMsg.tempSensor.objectTemp, 'Cels');


        //updateSensor(this.so, 'humidity', 0, 21.3, '\%rH');
        //updateSensor(this.so, 'barometer', 0, 986.7, 'mBar');
        //updateXYZSensor(this.so, 'accelerometer', 0, 0.02, 0.02, -0.96, 'G');
        //updateXYZSensor(this.so, 'gyrometer', 0, -1.45, 2.13, 0.83, 'deg/s');
        //updateXYZSensor(this.so, 'magnetometer', 0, 0.00, 0.00, 0.00, 'uT');
        //updateSensor(this.so, 'illuminance', 0, 626.7, 'Lux');
        //updateDigInSensor(this.so, 'dIn', 0, 1, 'Reed Switch');
    }

    if (sensorData.sDataMsg.frameControl &
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_lightSensor) {
        
        /* update the sensor values */
        this.lightsensor = {
            rawData: sensorData.sDataMsg.lightSensor.rawData 
        };

	updateSensor(this.so, 'illuminance', 0, sensorData.sDataMsg.lightSensor.rawData, 'Lux');
    }

    if (sensorData.sDataMsg.frameControl &
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_humiditySensor) {
        /* update the sensor values */
        this.humiditysensor = {
            temp: sensorData.sDataMsg.humiditySensor.temp,
            humidity: sensorData.sDataMsg.humiditySensor.humidity
        };
	
	// enable the line below to send the temperature sensor data reported by the humdity sensor
        //updateSensor(this.so, 'temperature', 2, sensorData.sDataMsg.humiditySensor.temp, 'Cels');
        updateSensor(this.so, 'humidity', 0, sensorData.sDataMsg.humiditySensor.humidity, '%RH');
	

    }



    if (sensorData.sDataMsg.frameControl &
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_pressureSensor) {
        /* update the sensor values */
        this.pressuresensor = {
            temp: sensorData.sDataMsg.pressureSensor.tempValue,
            humidity: sensorData.sDataMsg.pressureSensor.pressureValue
        };
     
     updateSensor(this.so, 'barometer', 0, sensorData.sDataMsg.pressureSensor.pressureValue, 'mBar');

    }

    if (sensorData.sDataMsg.frameControl & 
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_motionSensor) {
      this.motionsensor = {
        isMotion: sensorData.sDataMsg.motionSensor.isMotion
      };
      updateDigInSensor(this.so, 'Motion Sensor', 0, sensorData.sDataMsg.motionSensor.isMotion, 'Motion Sensor');
    }
    if (sensorData.sDataMsg.frameControl & 
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_batterySensor) {
      this.batterysensor = {
        voltageValue: sensorData.sDataMsg.batterySensor.voltageValue
      };

      updateSensor(this.so, 'voltage', 0, sensorData.sDataMsg.batterySensor.voltageValue, 'mV');

    }



    /* update rssi information */
    this.rssi = sensorData.rssi;
}

Device.prototype.rxConfigRspInd = function (devConfigData) {
    var device = this;
    if (devConfigData.sConfigMsg.status == 0) {
        device.active = 'true';
		/* Check the support sensor Types and add
		information elements for those */
        if (devConfigData.sConfigMsg.frameControl &
            dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_tempSensor) {
            /* initialize sensor information element */
            device.temperaturesensor = {
                ambienceTemp: 0,
                objectTemp: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl &
            dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_lightSensor) {
            /* initialize sensor information element */
            device.lightsensor = {
                rawData: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl &
            dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_humiditySensor) {
            /* initialize sensor information element */
            device.humiditysensor = {
                temp: 0,
                humidity: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl & 
          dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_pressureSensor){
            device.pressuresensor = {
              tempValue: 0,
              pressureValue: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl &
          dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_motionSensor) {
          device.motionsensor = {
            isMotion: 0
          };
        }
       if (devConfigData.sConfigMsg.frameControl & 
        dtimac_pb.Smsgs_dataFields.Smsgs_dataFields_batterySensor) {
            device.batterysensor = {
                voltageValue: 0
            };
        }
        device.reportingInterval = devConfigData.sConfigMsg.reportingInterval;
        if (device.capabilityInfo.rxOnWhenIdle == 1) {
            device.pollingInterval = devConfigData.sConfigMsg.pollingInterval;
        }
        else {
            device.pollingInterval = "always on device";
        }
    }
}

Device.prototype.deviceNotActive = function (inactiveDevInfo) {
    this.active = 'false';
}

Device.prototype.devUpdateInfo = function (shortAddr, capInfo) {
    this.shortAddress = shortAddr;
    this.capabilityInfo = capInfo;
    this.active = 'true';
}

module.exports = Device;
