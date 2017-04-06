/******************************************************************************
 @file appClient.js

 @brief TIMAC-2.0.0 Example Application - appClient Implementation

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

/* *********************************************************************
 * Require Modules for connection with TIMAC Application Server
 * ********************************************************************/
var net = require("net");
var protobuf = require("protocol-buffers");
var fs = require("fs");
var events = require("events");

var Device = require('./devices/device.js');
var NwkInfo = require('./nwkinfo/nwkinfo.js');

/* *********************************************************************
 * Defines
 * ********************************************************************/
/* APP Server Port, this should match the port number defined in the
file: appsrv.c */
const APP_SERVER_PORT = 5000;
/* Timeout in ms to attempt to reconnect to app server */
const APP_CLIENT_RECONNECT_TIMEOUT = 5000;
const PKT_HEADER_SIZE = 4;
const PKT_HEADER_LEN_FIELD = 0;
const PKT_HEADER_SUBSYS_FIELD = 2;
const PKT_HEADER_CMDID_FIELD = 3;

/* *********************************************************************
 * Variables
 * ********************************************************************/
/* AppClient Instance */
var appClientInstance;

/* ********************************************************************
* Initialization Function
**********************************************************************/
/*!
 * @brief      Constructor for appClient
 *
 * @param      none
 *
 * @retun      none
 */
function Appclient() {

    /* There should be only one app client */
    if (typeof appClientInstance !== "undefined") {
        return appClientInstance;
    }

    /* set-up the instance */
    appClientInstance = this;
    /* set-up to emit events */
    events.EventEmitter.call(this);
    /* set-up to connect to app server */
    var appClient = net.Socket();
    /* set-up to decode/encode proto messages */
    var timac_pb = protobuf(fs.readFileSync('appClient/protofiles/appsrv.proto'));
    /* Start the connection with app Server */
    appClient.connect(APP_SERVER_PORT, '127.0.0.1', function () {
        console.log("Connected to App Server");
        /* Request Network Information */
        appC_getNwkInfoFromAppServer();
    });
    /* set-up callback for incoming data from the app server */
    appClient.on('data', function (data) {
        /* Call the incoming data processing function */
        appC_processIncoming(data);
    });

    /* set-up to handle error event */
    appClient.on('error', function (data) {
		/* connection lost or unable to make connection with the
		appServer, need to get network and device info back again
		as those may have changed */
        console.log("ERROR: Rcvd Error on the socket connection with AppServer");
        console.log(data);
        appClientReconnect();
    });
    /* Device list array */
    this.connectedDeviceList = [];
    self = this;
    /* Network Information var */
    this.nwkInfo;

	/*
	 * @brief      This function is called to  attempt to reconnect with
	 * 			   the application server
 	 *
 	 * @param      none
 	 *
 	 * @retun      none
	*/
    function appClientReconnect() {
        if (typeof appClientInstance.clientReconnectTimer === 'undefined') {
            /*start a connection timer that tries to reconnect 5s */
            appClientInstance.clientReconnectTimer = setTimeout(function () {
                appClient.destroy();
                appClient.connect(APP_SERVER_PORT, '127.0.0.1', function () {
                    console.log("Connected to App Server");
					/* Request Network Information, we just
					reconnected get info again in case something may
					have changed */
                    appC_getNwkInfoFromAppServer();
                });
                clearTimeout(appClientInstance.clientReconnectTimer);
                delete appClientInstance.clientReconnectTimer;
            }, APP_CLIENT_RECONNECT_TIMEOUT);
        }
    }

	/* *****************************************************************
	* Process Incoming Messages from the App Server
	*******************************************************************/
	/*!
	* @brief        This function is called to handle incoming messages
	*				from the app server
	*
	* @param
	*
	* @return
	*/
    function appC_processIncoming(data) {
        var dataIdx = 0;
        while (dataIdx < data.length) {
            var rx_pkt_len = data[dataIdx + PKT_HEADER_LEN_FIELD] + (data[dataIdx + PKT_HEADER_LEN_FIELD + 1] << 8) + PKT_HEADER_SIZE;
            var ByteBuffer = require("bytebuffer");
            var rx_pkt_buf = new ByteBuffer(rx_pkt_len, ByteBuffer.LITTLE_ENDIAN);
            rx_pkt_buf.append(data.slice(dataIdx, dataIdx + rx_pkt_len), "hex", 0);
            dataIdx = dataIdx + rx_pkt_len;
            var rx_cmd_id = rx_pkt_buf.readUint8(PKT_HEADER_CMDID_FIELD);
            switch (rx_cmd_id) {
                case timac_pb.appsrv_CmdId.APPSRV_GET_NWK_INFO_CNF:
                    var networkInfoCnf = timac_pb.appsrv_getNwkInfoCnf.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processGetNwkInfoCnf(JSON.stringify(networkInfoCnf));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_GET_DEVICE_ARRAY_CNF:
                    var devArray = timac_pb.appsrv_getDeviceArrayCnf.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processGetDevArrayCnf(JSON.stringify(devArray));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_NWK_INFO_IND:
                    var networkInfoInd = timac_pb.appsrv_nwkInfoUpdateInd.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processNetworkUpdateIndMsg(JSON.stringify(networkInfoInd));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_DEVICE_JOINED_IND:
                    var newDeviceInfo = timac_pb.appsrv_deviceUpdateInd.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processDeviceJoinedIndMsg(JSON.stringify(newDeviceInfo));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_DEVICE_NOTACTIVE_UPDATE_IND:
                    var inactiveDevInfo = timac_pb.appsrv_deviceNotActiveUpdateInd.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processDeviceNotActiveIndMsg(JSON.stringify(inactiveDevInfo));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_DEVICE_DATA_RX_IND:
                    var devData = timac_pb.appsrv_deviceDataRxInd.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processDeviceDataRxIndMsg(JSON.stringify(devData));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_COLLECTOR_STATE_CNG_IND:
                    var coordState = timac_pb.appsrv_collectorStateCngUpdateInd.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processStateChangeUpdate(JSON.stringify(coordState));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_SET_JOIN_PERMIT_CNF:
                    var permitJoinCnf = timac_pb.appsrv_setJoinPermitCnf.decode(rx_pkt_buf.copy(PKT_HEADER_SIZE, rx_pkt_len).buffer);
                    appC_processSetJoinPermitCnf(JSON.stringify(permitJoinCnf));
                    break;
                case timac_pb.appsrv_CmdId.APPSRV_TX_DATA_CNF:
                    /* Add Applciation specific handling here*/
                    break;
                default:
                    console.log("ERROR: appClient: CmdId not processed: ", rx_cmd_id);
            }
        }
    }

	/*!
	* @brief        This function is called to handle incoming network update
	* 				message from the application
	*
	* @param
	*
	* @return
	*/
    function appC_processGetNwkInfoCnf(networkInfo) {
        var nInfo = JSON.parse(networkInfo);
        if (nInfo.status != 1) {
			/* Network not yet started, no nwk info returned
			by app server keep waiting until the server
			informs of the network info via network update indication
			*/
            console.log("network not started yet, now waiting for updates");
            return;
        }
        if (typeof self.nwkInfo === "undefined") {
            /* create a new network info element */
            self.nwkInfo = new NwkInfo(nInfo);
        }
        else {
            /* update the information */
            self.nwkInfo.updateNwkInfo(nInfo);
        }
        /* send the network information */
        appClientInstance.emit('nwkUpdate');
        /* Get Device array from appServer */
        appC_getDevArrayFromAppServer();
    }

	/*!
	* @brief        This function is called to handle incoming device array
	* 				cnf message from the application
	*
	* @param
	*
	* @return
	*/
    function appC_processGetDevArrayCnf(deviceArray) {
	/* erase the existing information, we will update
	information with the incoming information */
        self.connectedDeviceList = [];
        var devArray = JSON.parse(deviceArray);
        var i;
        for (i = 0; i < devArray.devInfo.length; i++) {
            var newDev = new Device(devArray.devInfo[i].devInfo.shortAddress, devArray.devInfo[i].devInfo.extAddress, devArray.devInfo[i].capInfo);
            /* Add device to the list */
            self.connectedDeviceList.push(newDev);
        }
        appClientInstance.emit('getdevArrayRsp');
    }
	/*!
	* @brief        This function is called to handle incoming network update
	* 				ind message from the application
	*
	* @param
	*
	* @return
	*/
    function appC_processNetworkUpdateIndMsg(networkInfo) {
        var nInfo = JSON.parse(networkInfo);
        if (typeof self.nwkInfo === "undefined") {
            /* create a new network info element */
            self.nwkInfo = new NwkInfo(nInfo);
        }
        else {
            /* update the information */
            self.nwkInfo.updateNwkInfo(nInfo);
        }
        /* send the netwiork information */
        appClientInstance.emit('nwkUpdate');
    }

	/*!
	* @brief        This function is called to handle incoming device joined
	* 				ind message informing of new device join from the
	* 				application
	*
	* @param 		deviceInfo - new device information
	*
	* @return       none
	*/
    function appC_processDeviceJoinedIndMsg(deviceInfo) {
        var devInfo = JSON.parse(deviceInfo);
        /* Check if the device already exists */
        for (var i = 0; i < self.connectedDeviceList.length; i++) {
            /* check if extended address match */
            if (self.connectedDeviceList[i].extAddress == devInfo.devDescriptor.extAddress) {
                self.connectedDeviceList[i].devUpdateInfo(devInfo.devDescriptor.shortAddress, devInfo.devCapInfo);
                /* send update to web client */
                appClientInstance.emit('connDevInfoUpdate', self.connectedDeviceList[i]);
                return;
            }
        }
        var newDev = new Device(devInfo.devDescriptor.shortAddress, devInfo.devDescriptor.extAddress, devInfo.devCapInfo);
        /* Add device to the list */
        var devIndex = self.connectedDeviceList.push(newDev) - 1;
        /* send network update to alert about the new device joining */
	appClientInstance.emit('nwkUpdate');
	/* send device update for the newly joined device */
	appClientInstance.emit('connDevInfoUpdate', self.connectedDeviceList[devIndex]);
    }

	/*!
	* @brief        This function is called to handle incoming message informing that
	* 				 a device is now inactive(?)
	*
	* @param 		inactiveDevInfo - inactive device information
	*
	* @return
	*/
    function appC_processDeviceNotActiveIndMsg(inactiveDevInfo) {
        var inactivedeviceInfo = JSON.parse(inactiveDevInfo);
        /* Find the index of the device in the list */
        var deviceIdx = findDeviceIndexShortAddr(inactivedeviceInfo.devDescriptor.shortAddress);
        if (deviceIdx !== -1) {
            self.connectedDeviceList[deviceIdx].deviceNotActive(inactivedeviceInfo);
            /* send update to web client */
            appClientInstance.emit('connDevInfoUpdate', self.connectedDeviceList[deviceIdx]);
        }
        else {
            console.log("ERROR: rcvd inactive status info for non-existing device");
        }
    }

	/*!
	* @brief        This function is called to handle incoming message informing of
	* 				reception of sensor data message/device config resp
	*				from a network device
	*
	* @param 		devData - incoming message
	*
	* @return       none
	*/
    function appC_processDeviceDataRxIndMsg(devData) {
        var deviceIdx = -1;
        var deviceData = JSON.parse(devData);

        /* Find the index of the device in the list */
        if (deviceData.srcAddr.addrMode == timac_pb.ApiMac_addrType.ApiMac_addrType_short) {
            deviceIdx = findDeviceIndexShortAddr(deviceData.srcAddr.shortAddr);
        }
        else if (deviceData.srcAddr.addrMode == timac_pb.ApiMac_addrType.ApiMac_addrType_extended) {
            deviceIdx = findDeviceIndexExtAddr(deviceData.srcAddr.extAddress.data);
        }
        else {
            console.log("ERROR: illegal addr mode value rcvd in sensor data msg", deviceData.srcAddr.addrMode);
            return;
        }
        if (deviceIdx !== -1) {
            if (deviceData.sDataMsg) {
                self.connectedDeviceList[deviceIdx].rxSensorData(deviceData);
                /* send the update to web client */
                appClientInstance.emit('connDevInfoUpdate', self.connectedDeviceList[deviceIdx]);
            }
            else if (deviceData.sConfigMsg) {
                self.connectedDeviceList[deviceIdx].rxConfigRspInd(deviceData);
                /* send the update to web client */
                appClientInstance.emit('connDevInfoUpdate', self.connectedDeviceList[deviceIdx]);
            }
            else {
                console.log("Developers can write handlers for new message types ")
            }
            return;
        }
        else {
            console.log("ERROR: rcvd sensor data message for non-existing device");
        }
    }

	/*!
	* @brief        This function is called to handle incoming message informing change
	* 				in the state of the PAN-Coordiantor
	*
	* @param 		coordState - updated coordinator state
	*
	* @return       none
	*/
    function appC_processStateChangeUpdate(coordState) {
        var state = JSON.parse(coordState);
        /* update state */
        self.nwkInfo.updateNwkState(state);
        /* send info to web client */
        appClientInstance.emit('nwkUpdate');
    }

	/*!
	* @brief        This function is called to handle incoming confirm for
	*				setjoinpermitreq
	*
	* @param 		permitJoinCnf - status of permit join req
	*
	* @return       none
	*/
    function appC_processSetJoinPermitCnf(permitJoinCnf) {
        var cnf = JSON.parse(permitJoinCnf);
        appClientInstance.emit('permitJoinCnf', { status: cnf.status });
    }

	/************************************************************************
	 * Device list utility functions
	 * *********************************************************************/
	/*!
	* @brief        Find index of device in the list based on short address
	*
	* @param 		srcAddr - short address of the device
	*
	* @return      index of the device in the connected device list, if present
	*			   -1, if not present
	*
	*/
    function findDeviceIndexShortAddr(srcAddr) {
        /* find the device in the connected device list and update info */
        for (var i = 0; i < self.connectedDeviceList.length; i++) {
            if (self.connectedDeviceList[i].shortAddress == srcAddr) {
                return i;
            }
        }
        return -1;
    }

	/*!
	* @brief        Find index of device in the list based on extended
	*				address
	*
	* @param 		extAddr - extended address of the device
	*
	* @return       index of the device in the connected device list, if present
	*			    -1, if not present
	*/
    function findDeviceIndexExtAddr(extAddr) {
        /* Check if the device already exists */
        for (var i = 0; i < self.connectedDeviceList.length; i++) {
            /* check if extended address match */
            if (self.connectedDeviceList[i].extAddress == extAddr) {
                return i;
            }
        }
        return -1;
    }

	/*****************************************************************
	Functions to send messages to the app server
	*****************************************************************/
	/*!
	* @brief        Send Config req message to application server
	*
	* @param 		none
	*
	* @return       none
	*/
    function appC_sendConfigReqToAppServer() {
        // This implementation only intends to provide an example
        // of how to send the message to an end node from the gateway
        // app. Hard coded values below were used to test
        // this implementation
        var devDesc = {
            panID: 0xACDC,
            shortAddress: 0x0001,
            extAddress: 0x00124B0008682c02
        };
        var configReq = {
            cmdId: timac_pb.Smsgs_cmdIds.Smsgs_cmdIds_configReq,
            frameControl: timac_pb.Smsgs_dataFields.Smsgs_dataFields_configSettings,
            reportingInterval: 1000,
            pollingInterval: 2000
        };

        var msg_buf = timac_pb.appsrv_txDataReq.encode({
            cmdId: timac_pb.appsrv_CmdId.APPSRV_TX_DATA_REQ,
            msgId: timac_pb.Smsgs_cmdIds.Smsgs_cmdIds_configReq,
            devDescriptor: devDesc,
            configReqMsg: configReq
        });
        appC_sendMsgToAppServer(msg_buf);
    }

	/*!
	* @brief        Send Config req message to application server
	*
	* @param 		none
	*
	* @return       none
	*/
    function appC_sendToggleLedMsgToAppServer(data) {

        // remove 0x from the address and then conver the hex value to decimal
        var dstAddr = parseInt(data.dstAddr.substring(2), 16).toString(10);
        // find the device index in the list
        var deviceIdx = findDeviceIndexShortAddr(dstAddr);
	if(deviceIdx == -1)
		deviceIdx = findDeviceIndexExtAddr(dstAddr);

        if(deviceIdx != -1)
        {
            // found the device information   
            var devDesc = {
                panID: self.nwkInfo.panCoord.panId,
                shortAddress: self.connectedDeviceList[deviceIdx].shortAddress,
                extAddress: self.connectedDeviceList[deviceIdx].extAddress
            };
            var toggleReq = {
                cmdId: timac_pb.Smsgs_cmdIds.Smsgs_cmdIds_toggleLedReq,
            };
        
            var msg_buf = timac_pb.appsrv_txDataReq.encode({
                cmdId: timac_pb.appsrv_CmdId.APPSRV_TX_DATA_REQ,
                msgId: timac_pb.Smsgs_cmdIds.Smsgs_cmdIds_toggleLedReq,
                devDescriptor: devDesc,
                toggleLedReq: toggleReq
            });
            appC_sendMsgToAppServer(msg_buf);
       }
    }

	/*!
	* @brief        Send get network Info Req to application server
	*
	* @param 		none
	*
	* @return       none
	*/
    function appC_getNwkInfoFromAppServer() {
        /* create the message */
        var msg_buf = timac_pb.appsrv_getNwkInfoReq.encode({
            cmdId: timac_pb.appsrv_CmdId.APPSRV_GET_NWK_INFO_REQ
        });
        appC_sendMsgToAppServer(msg_buf);
    }

	/*!
	* @brief        Send get device array Req to application server
	*
	* @param 		none
	*
	* @return       none
	*/
    function appC_getDevArrayFromAppServer() {
        /* create the message */
        var msg_buf = timac_pb.appsrv_getNwkInfoReq.encode({
            cmdId: timac_pb.appsrv_CmdId.APPSRV_GET_DEVICE_ARRAY_REQ
        });
        appC_sendMsgToAppServer(msg_buf);
    }

	/*!
	* @brief        Send join permit Req to application server
	*
	* @param 		data - containinfo about action required
	*					"open" - open network for device joins
	*				    "close"- close netwwork for device joins
	*
	* @return
	*/
    function appC_setJoinPermitAtAppServer(data) {
        var duration = 0x0;
        if (data.action == "open") {
            /* Set always open value */
            duration = 0xFFFFFFFF;
        }
        else {
            /* Set always close value */
            duration = 0x0;
        }
        /* create the message */
        var msg_buf = timac_pb.appsrv_setJoinPermitReq.encode({
            cmdId: timac_pb.appsrv_CmdId.APPSRV_SET_JOIN_PERMIT_REQ,
            duration: duration
        });
        appC_sendMsgToAppServer(msg_buf);
    }

	/*!
	* @brief        Send message to application server
	*
	* @param 		msg_buf - element containing data to be sent
	*					to the application server
	*
	* @return       none
	*/
    function appC_sendMsgToAppServer(msg_buf) {
        var ByteBuffer = require("bytebuffer");
        var pkt_buf = new ByteBuffer(PKT_HEADER_SIZE + msg_buf.length, ByteBuffer.LITTLE_ENDIAN)
            .writeShort(msg_buf.length, PKT_HEADER_LEN_FIELD)
            .writeUint8(timac_pb.timacAppSrvSysId.RPC_SYS_PB_TIMAC_APPSRV, PKT_HEADER_SUBSYS_FIELD)
            .writeUint8(msg_buf[1], PKT_HEADER_CMDID_FIELD)
            .append(msg_buf, "hex", PKT_HEADER_SIZE);
        /* Send the message to server */
        appClient.write(pkt_buf.buffer);
    };

	/*!
	* @brief        Allows to request for network
	*				information
	*
	* @param 		none
	*
	* @return       network information
	*/
    Appclient.prototype.appC_getNwkInfo = function () {
        /* send the netwiork information */
        appClientInstance.emit('nwkUpdate');
    };

	/*!
	* @brief        Allows to request for device array
	*				information
	*
	* @param 		none
	*
	* @return       connected device list
	*/
    Appclient.prototype.appC_getDeviceArray = function () {
	/* request the device information from the App Server */
        appC_getDevArrayFromAppServer();
    };

	/*!
	* @brief        Allows to modify permit join setting for the network
	*
	* @param 		none
	*
	* @return       data - containinfo about action required
	*					"open" - open network for device joins
	*				    "close"- close netwwork for device joins
	*/
    Appclient.prototype.appC_setPermitJoin = function (data) {
        appC_setJoinPermitAtAppServer(data);
    }

	/*!
	* @brief        Allows send toggle command to a network device
	*
	* @param 		none
	*
	* @return       none
	*/
    Appclient.prototype.appC_sendToggle = function (data) {
        appC_sendToggleLedMsgToAppServer(data);
    }


	/*!
	* @brief        Allows send config command to a network device
	*
	* @param 		none
	*
	* @return       none
	*/
    Appclient.prototype.appC_sendConfig = function (data) {
        appC_sendConfigReqToAppServer(data);
    }
}

Appclient.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Appclient;


