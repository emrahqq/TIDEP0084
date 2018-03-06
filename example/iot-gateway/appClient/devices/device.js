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
const Smsgs_dataFields = Object.freeze({
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
    waterLeakSensor: 0x0800
});

const dIn_iid = Object.freeze({
    motion: 0,
    hallEffectOpen: 1,
    hallEffectTampered: 2,
    doorLock: 3,
    waterLeak: 4
});

const temperature_iid = Object.freeze({
    ambienceTemp: 0,
    objectTemp: 1,
    humidityTemp: 2,
    pressureTemp: 3
});

const illuminance_iid = Object.freeze({
    lightSensor: 0
});

const humidity_iid = Object.freeze({
    humiditySensor: 0
});

const barometer_iid = Object.freeze({
    pressureSensor: 0
});

const actuator_iid = Object.freeze({
    fan: 0
});

const generic_iid = Object.freeze({
    batteryVoltage: 0
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
    devInfo.extAddress = extAddress;
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

function updateActuator(so, type, instance, on, dimmer, desc) {
    /* Sensor already exists, update its values */
    if (so.has(type, instance)) {
        so.write(type, instance, 'on/off', on, function (err, data) { });
        so.write(type, instance, "dimmer", dimmer, function (err, data) { });    
    }
    /* Need to initialize the sensor */
    else {
        so.init(type, instance, {
            "on/off": on,
            "dimmer": dimmer
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
    if (sensorData.frameControl & Smsgs_dataFields.tempSensor){
        /* update the sensor values */
        this.temperaturesensor = sensorData.tempSensor;
        updateSensor(this.so, 'temperature', temperature_iid.ambienceTemp, sensorData.tempSensor.ambienceTemp, 'Cel');
        updateSensor(this.so, 'temperature', temperature_iid.objectTemp, sensorData.tempSensor.objectTemp, 'Cel');
    }
    if (sensorData.frameControl & Smsgs_dataFields.lightSensor) {
        /* update the sensor values */
        this.lightsensor = sensorData.lightSensor;
        updateSensor(this.so, 'illuminance', illuminance_iid.lightSensor, sensorData.lightSensor.rawData, 'Lux');
    }
    if (sensorData.frameControl & Smsgs_dataFields.humiditySensor) {
        /* update the sensor values */
        this.humiditysensor = sensorData.humiditySensor;
        updateSensor(this.so, 'temperature', temperature_iid.humidityTemp, sensorData.humiditySensor.temp, 'Cel');
        updateSensor(this.so, 'humidity', humidity_iid.humiditySensor, sensorData.humiditySensor.humidity, '% RH');
    }

    if (sensorData.frameControl & Smsgs_dataFields.pressureSensor) {
        /* update the sensor values */
        this.pressuresensor = sensorData.pressureSensor;
        updateSensor(this.so, 'temperature', temperature_iid.pressureTemp, sensorData.pressureSensor.tempValue, 'Cel');
        updateSensor(this.so, 'barometer', barometer_iid.pressureSensor, sensorData.pressureSensor.pressureValue, 'mBar');
    }

    if (sensorData.frameControl & Smsgs_dataFields.motionSensor) {
        this.motionsensor = sensorData.motionSensor;
        updateDigInSensor(this.so, 'dIn', dIn_iid.motion, sensorData.motionSensor.isMotion, 'Motion Status');
    }

    if (sensorData.frameControl & Smsgs_dataFields.batteryVoltageSensor) {
        this.batterysensor = sensorData.batterySensor;
        updateSensor(this.so, 'generic', 0, sensorData.batterySensor.voltageValue, 'mV');
    }

    if (sensorData.frameControl & Smsgs_dataFields.hallEffectSensor) {
        this.halleffectsensor = sensorData.hallEffectSensor;
        updateDigInSensor(this.so, 'dIn', dIn_iid.hallEffectOpen, sensorData.hallEffectSensor.isOpen, 'Door/Window Status');
        updateDigInSensor(this.so, 'dIn', dIn_iid.hallEffectTampered, sensorData.hallEffectSensor.isTampered, 'Door/Window Tamper Status');
    }

    if (sensorData.frameControl & Smsgs_dataFields.fanSensor) {
        this.fansensor = sensorData.fanSensor;
        updateActuator(this.so, 'actuator', actuator_iid.fan, (sensorData.fanSensor.fanSpeed !== 0), sensorData.fanSensor.fanSpeed, "Fan Speed");
    }

    if (sensorData.frameControl & Smsgs_dataFields.doorLockSensor) {
        this.doorlocksensor = sensorData.doorLockSensor;
        updateDigInSensor(this.so, 'dIn', dIn_iid.doorLock, sensorData.doorLockSensor.isLocked, "Lock Status");
    }

    if (sensorData.frameControl & Smsgs_dataFields.waterLeakSensor){
        /* update the sensor values */
        this.waterleaksensor = sensorData.waterleakSensor;
        updateDigInSensor(this.so, 'dIn', dIn_iid.waterLeak, sensorData.waterleakSensor.status, 'Water Leak Status');
    }

    /* update rssi information */
    this.rssi = sensorData.rssi;

    /* time stanpd of last data recieved*/
    this.lastreported = getDateTime();
}

Device.prototype.rxConfigRspInd = function (devConfigData) {
    var device = this;
    if (devConfigData.status == 0) {
        device.active = 'true';
		/* Check the support sensor Types and add
		information elements for those */
        if (devConfigData.frameControl & Smsgs_dataFields.tempSensor) {
            /* initialize sensor information element */
            device.temperaturesensor = {
                ambienceTemp: 0,
                objectTemp: 0
            };
        }
        if (devConfigData.frameControl & Smsgs_dataFields.lightSensor) {
            /* initialize sensor information element */
            device.lightsensor = {
                rawData: 0
            };
        }
        if (devConfigData.frameControl & Smsgs_dataFields.humiditySensor) {
            /* initialize sensor information element */
            device.humiditysensor = {
                temp: 0,
                humidity: 0
            };
        }
        if (sensorData.frameControl & Smsgs_dataFields.pressureSensor) {
            /* update the sensor values */
            device.pressuresensor = {
                temp: 0,
                pressure: 0
            };
        }
        if (sensorData.frameControl & Smsgs_dataFields.motionSensor) {
            device.motionsensor = {
                isMotion: false
            };
        }

        if (sensorData.frameControl & Smsgs_dataFields.batteryVoltageSensor) {
            device.batterysensor = {
                voltage: 0
            };
        }

        if (sensorData.frameControl & Smsgs_dataFields.hallEffectSensor) {
            device.halleffectsensor = {
                isOpen: false,
                isTampered: false
            };
        }

        if (sensorData.frameControl & Smsgs_dataFields.fanSensor) {
            device.fansensor = {
                fanSpeed: 0
            };
        }

        if (sensorData.frameControl & Smsgs_dataFields.doorLockSensor) {
            device.doorlocksensor = {
                isLocked: false
            };
        }
        if (devConfigData.frameControl & Smsgs_dataFields.waterleakSensor) {
            /* initialize sensor information element */
            device.waterleaksensor = {
                status: 0
            };
        }
        device.reportingInterval = devConfigData.reportingInterval;
        if (device.capabilityInfo.rxOnWhenIdle == 1) {
            device.pollingInterval = devConfigData.pollingInterval;
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
    if (shortAddr != null)
        this.shortAddress = shortAddr;
    if (capabilityInfo != null)
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
