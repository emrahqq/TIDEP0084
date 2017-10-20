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
var fs = require("fs");
var SmartObject = require('smartobject');
var Long = require("long");

/********************************************************************
 * Defines
 * *****************************************************************/
var Smsgs_dataFields = Object.freeze({
    tempSensor: 0x0001,
    lightSensor: 0x0002,
    humiditySensor: 0x0004,
    msgStats: 0x0008,
    configSettings: 0x0010,
    pressureSensor: 0x0020,
    motionSensor: 0x0040,
    batteryVoltageSensor: 0x0080,
    hallEffectSensor: 0x0100,
    fanSensor: 0x0200,
    doorLockSensor: 0x0400,
    genericSensor: 0x0800
});


/*!
 * @brief      Constructor for device objects
 *
 * @param      shortAddress - 16 bit address of the device
 * 			   extAddress - 64 bit IEEE address of the device
 * 			   capabilityInfo - device capability information
 *
 * @retun      device object
 */
function Device(shortAddress, extAddress, capabilityInfo) {
    var devInfo = this;
    devInfo.shortAddress = shortAddress;
    devInfo.extAddress = extAddress.toString(16);
    devInfo.capabilityInfo = capabilityInfo;
    devInfo.active = 'true';
    devInfo.so = new SmartObject();
    return devInfo;
}

/**
 *
 */
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
            "sensorValue": value,
            "units": units,
            "minMeaValue": value,
            "maxMeaValue": value
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
    /* recieved message from the device, set as active */
    this.active = 'true';
	/* Check the support sensor Types and
	add information elements for those */
    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.tempSensor){
        /* update the sensor values */
        this.temperaturesensor = {
            ambienceTemp: sensorData.sDataMsg.tempSensor.ambienceTemp,
            objectTemp: sensorData.sDataMsg.tempSensor.objectTemp
        };
        // create/upate ambience temp data
        updateSensor(this.so, 'temperature', 0, sensorData.sDataMsg.tempSensor.ambienceTemp, 'Cels');
    }
    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.lightSensor) {
        /* update the sensor values */
        this.lightsensor = {
            rawData: sensorData.sDataMsg.lightSensor.rawData
        };
        updateSensor(this.so, 'illuminance', 0, sensorData.sDataMsg.lightSensor.rawData, 'Lux');
    }
    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.humiditySensor) {
        /* update the sensor values */
        this.humiditysensor = {
            temp: sensorData.sDataMsg.humiditySensor.temp,
            humidity: sensorData.sDataMsg.humiditySensor.humidity
        };
        updateSensor(this.so, 'humidity', 0, sensorData.sDataMsg.humiditySensor.humidity, '%RH');
    }
    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.genericSensor) {
        /* update the sensor values */
        this.genericsensor = {
            genericRawData: sensorData.sDataMsg.genericSensor.genericRawData
        };
        updateSensor(this.so, 'genericrawdata', 0, sensorData.sDataMsg.genericSensor.genericRawData, 'raw');
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.pressureSensor) {
        /* update the sensor values */
        this.pressuresensor = {
            temp: sensorData.sDataMsg.pressureSensor.tempValue,
            pressure: sensorData.sDataMsg.pressureSensor.pressureValue
        };
        updateSensor(this.so, 'barometer', 0, sensorData.sDataMsg.pressureSensor.pressureValue, 'mBar');
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.motionSensor) {
            this.motionsensor = {
                isMotion: sensorData.sDataMsg.motionSensor.isMotion
      };
      updateDigInSensor(this.so, 'motion', 0, sensorData.sDataMsg.motionSensor.isMotion, 'Motion Sensor');
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.batteryVoltageSensor) {
        this.batterysensor = {
            voltage: sensorData.sDataMsg.batterySensor.voltageValue
      };
      updateSensor(this.so, 'voltage', 0, sensorData.sDataMsg.batterySensor.voltageValue, 'mV');
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.hallEffectSensor) {
      this.halleffectsensor = {
        isOpen: sensorData.sDataMsg.hallEffectSensor.isOpen,
        isTampered: sensorData.sDataMsg.hallEffectSensor.isTampered
      };
      updateDigInSensor(this.so, 'halleffect', 0, sensorData.sDataMsg.hallEffectSensor.isOpen, 'Door/Window Sensor');
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.fanSensor) {
        this.fansensor = {
            fanSpeed: sensorData.sDataMsg.fanSensor.fanSpeed
        };
        updateSensor(this.so, 'fan', 0, sensorData.sDataMsg.fanSensor.fanSpeed, "Fan Speed");
    }

    if (sensorData.sDataMsg.frameControl & Smsgs_dataFields.doorLockSensor) {
        this.doorlocksensor = {
            isLocked: sensorData.sDataMsg.doorLockSensor.isLocked
        };
        updateDigInSensor(this.so, 'doorlock', 0, sensorData.sDataMsg.doorLockSensor.isLocked, "Lock Status");
    }

    /* update rssi information */
    this.rssi = sensorData.rssi;

    /* time stanpd of last data recieved*/
    this.lastreported = getDateTime();
}

Device.prototype.rxConfigRspInd = function (devConfigData) {
    var device = this;
    if (devConfigData.sConfigMsg.status == 0) {
        device.active = 'true';
		/* Check the support sensor Types and add
		information elements for those */
        if (devConfigData.sConfigMsg.frameControl & Smsgs_dataFields.tempSensor) {
            /* initialize sensor information element */
            device.temperaturesensor = {
                ambienceTemp: 0,
                objectTemp: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl & Smsgs_dataFields.lightSensor) {
            /* initialize sensor information element */
            device.lightsensor = {
                rawData: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl & Smsgs_dataFields.humiditySensor) {
            /* initialize sensor information element */
            device.humiditysensor = {
                temp: 0,
                humidity: 0
            };
        }
        if (devConfigData.sConfigMsg.frameControl & Smsgs_dataFields.genericSensor) {
            /* initialize sensor information element */
            device.genericsensor = {
                genericRawData: 0
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

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return hour + ":" + min + ":" + sec + " " + year + "-" + month + "-" + day ;

}


module.exports = Device;
