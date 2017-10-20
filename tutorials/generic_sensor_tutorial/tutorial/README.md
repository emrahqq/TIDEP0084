# Tutorial - Adding a Generic Sensor to the Sensor To Cloud Gateway

This project adds a generic sensor support to the Sensor To Cloud gateway project and the Sensor example application running on the CC13x0 LaunchPad. For this tutorial, the generic sensor capabilities will only be added to the local gateway, no cloud based support will be included. It should however be easy to follow the same guidelines to add support for any new sensor to cloud service of choice. 

In this example, the generic sensor does the following:
1. The generic sensor will send a value that corresponds to the number of times BTN-2 is pressed. (each time BTN-2 is pressed, the generic sensor value is incremented)
2. The generic sensor button on the gateway application will send a command to the corresponding sensor to print "Hello from Sensor To Cloud Gateway" to a terminal. 

This tutorial can be used as a reference to add any desired sensor for your end application.

## Requirements
- 2x CC1310 LaunchPads ([http://www.ti.com/tool/LAUNCHXL-CC1310](http://www.ti.com/tool/LAUNCHXL-CC1310))
- UniFlash ([http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH))
- SIMPLELINK-CC13X0-SDK ([http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK](http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK))
- Code Composer Studio ([http://www.ti.com/tool/CCSTUDIO](http://www.ti.com/tool/CCSTUDIO))
    - Version must be supported in the current SIMPLELINK-CC13x0-SDK
- Linux machine (Ubuntu 14.04) or Beagle Bone Black ([PROCESSOR-SDK-LINUX-AM335X](http://www.ti.com/tool/PROCESSOR-SDK-AM335X))
    - Node.js (already incldued in PROCESSOR-SDK-LINUX-AM335X)

## Flash Coprocessor on to CC13x0 LaunchPad

The coprocessor hex files are included in the `/tutorial/hex/` folder. Therefore you just need to simply flash this file to one of the LaunchPads. 

1. If you have not already, download UniFlash from [http://www.ti.com/tool/UNIFLASH](http://www.ti.com/tool/UNIFLASH). 
2. Open UniFlash, connect one of the CC1310 LaunchPads to your compiter and choose the connected device in UniFlash. 
3. Click "Browse" and select the `/tutorial/hex/coprocessor_cc1310lp.hex` file. 
4. Click the "Load Image" button to flash the image.  


# Add Generic Sensor to sensor_cc1310lp CCS Project

1. Since the original `sensor_cc1310lp` project (which acts as the sensor node in the network) is not included in this tutorial, you will need to download and install the latest `simplelink_cc13x0_sdk` from [http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK](http://www.ti.com/tool/SIMPLELINK-CC13X0-SDK). 
2. Create a new workspace in CCS. 
3. In CCS, import the `sensor_cc1310lp` project by going to "Project" --> "Import CCS Projects".
4. "Browse" for the folder containing the `sensor_cc1310lp` project. It should look similar to the path below. 
    - `C:\ti\simplelink_cc13x0_sdk_1_50_00_08\examples\rtos\CC1310_LAUNCHXL\ti154stack\`
5. Select the `sensor_cc1310lp` project from the "Discovered Projects" and click "Finish".
6. Once the project is imported, Copy and paste the `sensor_cc1310lp` CCS project in the CCS Project Explorer window. Rename the new project `sensor_generic_cc1310lp`. All of the following changes should be made to this new project. 

For more details on the sensor example application and TI 15.4-Stack please refer to the TI 15.4-Stack User guide part of the CC13x0 SDK. 

### Now let's start modifying the code in our new `sensor_generic_cc1310lp` project.

*** PLEASE NOTE: The following code snippets include some of the original code as a reference to show you where to add the new code. Do not just blindly copy and paste the code! Note the `...` indicate that there is additional code. The original code snippets are based on SIMPLELINK-CC13x0-SDK V1.50.00.08. In future SDK releases, there may be slight differences in this tutorial and the projects in the latest SDK ***

First thing we need to do is add the constants and definitions regarding the generic sensor in the `smsgs.h` file. This file defines the message structures that are sent and received over the air.  

## smsgs.h

Add the constants that define the lengths of the sensor data size and commands.

```c
/******************************************************************************
Constants and definitions
*****************************************************************************/
...
...
/*! Toggle Led Request message length (over-the-air length) */
#define SMSGS_TOGGLE_LED_RESPONSE_MSG_LEN 2
/*! Length of the genericSensor portion of the sensor data message */
#define SMSGS_SENSOR_GENERIC_LEN 2
/*! Generic Request message length (over-the-air length) */
#define SMSGS_GENERIC_REQUEST_MSG_LEN 1
/*! Generic Request message length (over-the-air length) */ 
#define SMSGS_GENERIC_RESPONSE_MSG_LEN 2
```

Define the command ID values for `Smsgs_cmdIds_genericReq` and `Smsgs_cmdIds_genericRsp`. These values are 12 and 13 so they do not conflict with other commands defined in the Sensor To Cloud Application.

```c
typedef enum
 {
    /*! Configuration message, sent from the collector to the sensor */
    Smsgs_cmdIds_configReq = 1,
    /*! Configuration Response message, sent from the sensor to the collector */
    Smsgs_cmdIds_configRsp = 2,
    /*! Tracking request message, sent from the the collector to the sensor */
    Smsgs_cmdIds_trackingReq = 3,
     /*! Tracking response message, sent from the sensor to the collector */
    Smsgs_cmdIds_trackingRsp = 4,
    /*! Sensor data message, sent from the sensor to the collector */
    Smsgs_cmdIds_sensorData = 5,
    /* Toggle LED message, sent from the collector to the sensor */
    Smsgs_cmdIds_toggleLedReq = 6,
    /* Toggle LED response msg, sent from the sensor to the collector */
    Smsgs_cmdIds_toggleLedRsp = 7,
    /* new data type for ramp data */
    Smsgs_cmdIds_rampdata = 8,
    /*! OAD mesages, sent/received from both collector and sensor */
    Smsgs_cmdIds_oad = 9,
    /* Broadcast control msg, sent from the collector to the sensor */
    Smgs_cmdIds_broadcastCtrlMsg = 10,
    /* Toggle LED message, sent from the collector to the sensor */
    Smsgs_cmdIds_genericReq = 12,
    /* Toggle LED response msg, sent from the sensor to the collector */
    Smsgs_cmdIds_genericRsp = 13
 } Smsgs_cmdIds_t;
 ```

Define the frame control value for the generic sensor values. This value is `0x0800` in order to not conflict with other frame control values defined in the Sensor To Cloud Application.

 ```c
 /*!
 Frame Control field states what data fields are included in reported
 sensor data, each value is a bit mask value so that they can be combined
 (OR'd together) in a control field.
 When sent over-the-air in a message this field is 2 bytes.
 */
typedef enum
{
    /*! Temperature Sensor */
    Smsgs_dataFields_tempSensor = 0x0001,
    /*! Light Sensor */
    Smsgs_dataFields_lightSensor = 0x0002,
    /*! Humidity Sensor */
    Smsgs_dataFields_humiditySensor = 0x0004,
    /*! Message Statistics */
    Smsgs_dataFields_msgStats = 0x0008,
    /*! Config Settings */
    Smsgs_dataFields_configSettings = 0x0010,
    /*! Temperature Sensor */
    Smsgs_dataFields_genericSensor = 0x0800,
} Smsgs_dataFields_t;
```

Add the structs detailing the ability to request and respond to generic messages. 

```c
/*!
 Generic Request message: sent from controller to the sensor.
 */
typedef struct _Smsgs_genericreqmsg_t
{
    /*! Command ID - 1 byte */
    Smsgs_cmdIds_t cmdId;
} Smsgs_genericReqMsg_t;

/*!
Generic Response message: sent from the sensor to the collector
 in response to the Generic Request message.
 */
typedef struct _Smsgs_genericrspmsg_t
{
    /*! Command ID - 1 byte */
    Smsgs_cmdIds_t cmdId;
} Smsgs_genericRspMsg_t;
```

Add a struct defining the data that will be broadcasted by the generic sensor. 

```c
/*!
 Generic Sensor Field
 */
typedef struct _Smsgs_genericsensorfield_t
{
    /*! Raw Sensor Data read out of the OPT2001 light sensor */
    uint16_t genericRawData;
} Smsgs_genericSensorField_t;
```

Add the genericSensor to the sensor Msg struct. 

```c
/*!
 Sensor Data message: sent from the sensor to the collector
 */
typedef struct _Smsgs_sensormsg_t
{
    /*! Command ID */
    Smsgs_cmdIds_t cmdId;
    /*! Extended Address */
    uint8_t extAddress[SMGS_SENSOR_EXTADDR_LEN];
    /*! Frame Control field - bit mask of Smsgs_dataFields */
    uint16_t frameControl;
    /*!
     Temp Sensor field - valid only if Smsgs_dataFields_tempSensor
     is set in frameControl.
     */
    Smsgs_tempSensorField_t tempSensor;
    /*!
     Light Sensor field - valid only if Smsgs_dataFields_lightSensor
     is set in frameControl.
     */
    Smsgs_lightSensorField_t lightSensor;
    /*!
     Humidity Sensor field - valid only if Smsgs_dataFields_humiditySensor
     is set in frameControl.
     */
    Smsgs_humiditySensorField_t humiditySensor;
    /*!
     Message Statistics field - valid only if Smsgs_dataFields_msgStats
     is set in frameControl.
     */
    Smsgs_msgStatsField_t msgStats;
    /*!
     Configuration Settings field - valid only if
     Smsgs_dataFields_configSettings is set in frameControl.
     */
    Smsgs_configSettingsField_t configSettings;
    /*!
     Generic Sensor field - valid only if Smsgs_dataFields_genericSensor
     is set in frameControl.
     */
    Smsgs_genericSensorField_t genericSensor;
} Smsgs_sensorMsg_t;
```


## sensor.c

We will now modify the `sensor.c` file to primarily handle packaging and sending the generic sensor data to the collector/cloud application. 

To print text and values to the terminal include the following header:
```c
#include "board_lcd.h"
```

Define the external global variable that will be used as our "generic sensor" value. This will be the value that we will send to the collector/cloud application. 

```c
/******************************************************************************
 Global variables
 *****************************************************************************/

extern uint16_t generic_sensor_val;
```

Define the Generic Sensor data struct. 

```c
...
...
/*!
 Generic Sensor field - valid only if Smsgs_dataFields_genericSensor
 is set in frameControl.
 */
STATIC Smsgs_genericSensorField_t genericSensor =
    { 0 };
...
...
```

Now let's initialize the frame control settings by adding the Generic Sensor to the frame control config settings. 

```c
void Sensor_init(void)
{
    ...
    ...
    configSettings.frameControl |= Smsgs_dataFields_configSettings;
    configSettings.frameControl |= Smsgs_dataFields_genericSensor;
    ...
    ...
```

When we go to send the sensor data, we need to copy the sensor values to the message data struct. We will only do this if the generic sensor is currently included in the frame control.

```c
/*!
 @brief   Build and send sensor data message
 */
static void processSensorMsgEvt(void)
{
    ...
    ...
    if(sensor.frameControl & Smsgs_dataFields_configSettings)
    {
        sensor.configSettings.pollingInterval = configSettings.pollingInterval;
        sensor.configSettings.reportingInterval = configSettings
                        .reportingInterval;
    }
    if(sensor.frameControl & Smsgs_dataFields_genericSensor)
    {
       memcpy(&sensor.genericSensor, &genericSensor,
              sizeof(Smsgs_genericSensorField_t));
    }
    ...
    ...
```

As we send the message, we need to add the length of the generic sensor to the overall length of the message to be sent. We then need to append the generic sensor raw data to the message buffer. Again, before we add the length and the value to the buffer, we need to check to ensure the sensor is included in the frame control. Note that when we add the generic sensor raw data to the pBuf, we do this after we add the humidity sensor values. This order matters when adding it to the message buffer. 

```c
static bool sendSensorMessage(ApiMac_sAddr_t *pDstAddr, Smsgs_sensorMsg_t *pMsg)
{
    ...
    ...
    if(pMsg->frameControl & Smsgs_dataFields_configSettings)
    {
        len += SMSGS_SENSOR_CONFIG_SETTINGS_LEN;
    }
    if(pMsg->frameControl & Smsgs_dataFields_genericSensor)
    {
       len += SMSGS_SENSOR_GENERIC_LEN;
    }
    ...
    ...
        if(pMsg->frameControl & Smsgs_dataFields_humiditySensor)
        {
            pBuf = Util_bufferUint16(pBuf, pMsg->humiditySensor.temp);
            pBuf = Util_bufferUint16(pBuf, pMsg->humiditySensor.humidity);
        }
        if(pMsg->frameControl & Smsgs_dataFields_genericSensor)
        {
            pBuf = Util_bufferUint16(pBuf, pMsg->genericSensor.genericRawData);
        }
        ...
        ...
```

When we validate the frame control, we need to also ensure the generic sensor is properly included in the frame. 

```c
static uint16_t validateFrameControl(uint16_t frameControl)
{
    ...
    ...
    if(frameControl & Smsgs_dataFields_configSettings)
    {
        newFrameControl |= Smsgs_dataFields_configSettings;
    }
    if(frameControl & Smsgs_dataFields_genericSensor)
    {
       newFrameControl |= Smsgs_dataFields_genericSensor;
    }

    return (newFrameControl);
}
```

Let's now setup how the sensor will respond to a generic command sent from the collector. When the generic command is received, we want to have the sensor print out a local response to the terminal. After this has occurred, we want to send back a response to the collector. Add the following case to the switch(cmdID) statement. The `Ssf_genericCMD()` function will execute the terminal printing and return true.   

```c
static void dataIndCB(ApiMac_mcpsDataInd_t *pDataInd)
{
...
...
 switch(cmdId)
    {
    ...
    ...
    case Smsgs_cmdIds_genericReq:
    /* Make sure the message is the correct size */
    if(pDataInd->msdu.len == SMSGS_GENERIC_REQUEST_MSG_LEN)
    {

        /* send the response message directly */
        cmdBytes[0] = (uint8_t) Smsgs_cmdIds_genericRsp;
        cmdBytes[1] = Ssf_genericCMD();
        Sensor_sendMsg(Smsgs_cmdIds_genericRsp,
                &pDataInd->srcAddr, true,
                SMSGS_GENERIC_RESPONSE_MSG_LEN,
                cmdBytes);
    }
    break;
    ...
    ...
```

Every time the sensor sends data to the collector, we need to poll for new local sensor data. In the `readSensors()` function we want to update the `genericSensor.genericRawData` value with the current external `generic_sensor_val` variable. Let's also print this current value out to the terminal so we can see what it is.

```c
/*!
 * @brief   Manually read the sensors
 */
static void readSensors(void)
{
    ...
    ...
    genericSensor.genericRawData = generic_sensor_val;
    LCD_WRITE_STRING_VALUE("Reading GenericSensorVal: ", generic_sensor_val, 10, 4);
}
```


## ssf.c

In the `ssf.c` file, the sensor will handle updating the `generic_sensor_value` every time the BTN-2 is pushed on the sensor LaunchPad. 

First, let's declare the `generic_sensor_val` as a `uint16_t`.

```c
/******************************************************************************
 Public variables
 *****************************************************************************/
...
...
/*! Generic Sensor Value */
uint16_t generic_sensor_val = 0;
...
...
```

Then, add the condition that if the right key (BTN-2) is pressed, the `generic_sensor_value` will increment. Let's also print the new value to the terminal so we can see it incrementing as it is pressed. 

```c
void Ssf_processEvents(void)
{
    ...
    ...
    else if(keys & KEY_RIGHT)
    {
        generic_sensor_val += 1;
        LCD_WRITE_STRING_VALUE("GenericSensorVal: ", generic_sensor_val, 10, 4);
    ...
    ...
    }
```

Lastly, we want to handle the response of receiving a generic command from the collector. Define the `Ssf_genericCMD()` function and have it print out a simple message to the terminal. 

```c
/*!
 The application calls this function to enact a generic command (UART printing)

 Public function defined in ssf.h
 */
bool Ssf_genericCMD(void)
{
    LCD_WRITE_STRING("Hello from Sensor To Cloud Gateway", 4);

    return(true);
}
```

## ssf.h

In the `ssf.h` header, define the new `Ssf_genericCMD()` function.

```c
/*!
 * @brief       The application calls this function to do a generic function (UART printing)
 *
 * @return     true
 */
extern bool Ssf_genericCMD(void);
```

Once you have made all of the changes above, build the new project in CCS. 

If you have no build errors, Debug the project to the second LaunchPad. "Stop" the debugger to start running the firmware on the LaunchPad.  

# Modify the "Sensor To Cloud" application to add the Generic Sensor

Now let's make the necessary changes to the Local Gateway Sensor To Cloud application to view the generic sensor data and to send generic commands to the sensor. To do this, we need to make changes to the C based `collector` and JavaScript based `iot-gateway` applications. The C based `collector` application is responsible for receiving all incoming data as well as sending commands to appropriate sensors. The JavaScript based `iot-gateway` application is responsible for displaying this data in a web app form and process commands from the web app. Let's first make the necessary changes to the `collector` application. 

## Modify the Linux Based Collector to add Generic Sensor

First we need to modify the C based collector application to receive the generic sensor data. Navigate to the `/tutorial/SensorToCloud/example/collector/` folder and make changes/additions to the following files. 

As in the `sensor_generic_cc1310lp` project, we need to modify the `smsgs.h` file to include the generic sensor definitions. Let's start by adding the generic sensor msg lengths. 

## smsgs.h

```c
...
...
/*! Toggle Led Request message length (over-the-air length) */
#define SMSGS_TOGGLE_LED_RESPONSE_MSG_LEN 2
/*! Length of the genericSensor portion of the sensor data message */
#define SMSGS_SENSOR_GENERIC_LEN 2
/*! Generic Request message length (over-the-air length) */
#define SMSGS_GENERIC_REQUEST_MSG_LEN 1
/*! Generic Request message length (over-the-air length) */
#define SMSGS_GENERIC_RESPONSE_MSG_LEN 2
...
...
```

Then add the command IDs for the generic command and response. As you can now see, we make the `Smsgs_cmdIds_genericReq` equal to 12 due to the additional commands that are defined in the Sensor To Cloud application. 

```c
 typedef enum
 {
    ...
    ...
     /*! Door lock command */
    Smsgs_cmdIds_doorlockChg = 11,
    /* Toggle LED message, sent from the collector to the sensor */
    Smsgs_cmdIds_genericReq = 12,
    /* Toggle LED response msg, sent from the sensor to the collector */
    Smsgs_cmdIds_genericRsp = 13
 } Smsgs_cmdIds_t;
 ```

 Add the generic sensor frame control value. 

```c
typedef enum
{
    ...
    ...
    /*! Door Lock Sensor */
    Smsgs_dataFields_doorLockSensor = 0x0400,
    /*! Temperature Sensor */
     Smsgs_dataFields_genericSensor = 0x0800,
} Smsgs_dataFields_t;
```

Add the generic command and response struct definitions. 

```c
/*!
 Generic Request message: sent from controller to the sensor.
 */
 typedef struct _Smsgs_genericreqmsg_t
 {
     /*! Command ID - 1 byte */
     Smsgs_cmdIds_t cmdId;
 } Smsgs_genericReqMsg_t;
 
 /*!
 Generic Response message: sent from the sensor to the collector
  in response to the Generic Request message.
  */
 typedef struct _Smsgs_genericrspmsg_t
 {
     /*! Command ID - 1 byte */
     Smsgs_cmdIds_t cmdId;
 } Smsgs_genericRspMsg_t;
 ```

Add the generic sensor data struct definition. 

 ```c
 /*!
 Generic Sensor Field
 */
typedef struct _Smsgs_genericsensorfield_t
{
    /*! Raw Sensor Data read out of the generic sensor */
    uint16_t genericRawData;
} Smsgs_genericSensorField_t;
```

Add the generic sensor to the sensor message struct. 

```c
typedef struct _Smsgs_sensormsg_t
{
    ...
    ...
    /*!
        Door Lock Sensor Field - valid only if
        Smsgs_dataFields_doorLockSensor is set in frameControl.
    */
    Smsgs_doorLockSensorField_t doorLockSensor;
    /*!
     Generic Sensor field - valid only if Smsgs_dataFields_genericSensor
     is set in frameControl.
     */
     Smsgs_genericSensorField_t genericSensor;
} Smsgs_sensorMsg_t;
```


## collector.c

Now let's modify the `collector.c` file to include the ability to read the generic sensor data from the incoming data buffer. 

First let's add the generic sensor to the frame control config parameters. 

```c
...
...
/* Default configuration frame control */
#define CONFIG_FRAME_CONTROL (Smsgs_dataFields_tempSensor | \
                              Smsgs_dataFields_lightSensor | \
                              Smsgs_dataFields_humiditySensor | \
                              Smsgs_dataFields_msgStats | \
                              Smsgs_dataFields_configSettings | \
                              Smsgs_dataFields_pressureSensor | \
                              Smsgs_dataFields_motionSensor | \
                              Smsgs_dataFields_batterySensor | \
                              Smsgs_dataFields_hallEffectSensor | \
                              Smsgs_dataFields_fanSensor | \
                              Smsgs_dataFields_doorLockSensor | \
                              Smsgs_dataFields_genericSensor)
...
...
```

Let's update the reporting interval to 10 seconds so we can see changes quicker in Sensor To Cloud application. 

```c
/* Default configuration reporting interval, in milliseconds */
#define CONFIG_REPORTING_INTERVAL_DEFAULT 10000
```

Now let's add the most important part, getting the actual data from the generic sensor! Again, we will only get this data if the sensor is defined in the frame control. Make sure the reading of the generic sensor data occurs after the humidity sensor as seen below. Again, the order in which we read it matters. 

```c
static void processSensorData(ApiMac_mcpsDataInd_t *pDataInd)
{
   ...
   ...
    if(sensorData.frameControl & Smsgs_dataFields_humiditySensor)
    {
        sensorData.humiditySensor.temp = Util_buildUint16(pBuf[0], pBuf[1]);
        pBuf += 2;
        sensorData.humiditySensor.humidity = Util_buildUint16(pBuf[0], pBuf[1]);
        pBuf += 2;
    }

    if(sensorData.frameControl & Smsgs_dataFields_genericSensor)
    {
        sensorData.genericSensor.genericRawData = Util_buildUint16(pBuf[0], pBuf[1]);
        pBuf += 2;
    }
    ...
    ...
```

We need to make a function that will send the generic request to a sensor with a given address. Add this entire function to the `collector.c` file. 

```c
/*!
 Build and send the generic message to a device.

 Public function defined in collector.h
 */
 Collector_status_t Collector_sendGenericRequest(ApiMac_sAddr_t *pDstAddr)
 {
     Collector_status_t status = Collector_status_invalid_state;
 
     /* Are we in the right state? */
     if(cllcState >= Cllc_states_started)
     {
         Llc_deviceListItem_t item;
 
         /* Is the device a known device? */
         if(Csf_getDevice(pDstAddr, &item))
         {
             uint8_t buffer[SMSGS_GENERIC_REQUEST_MSG_LEN];
 
             /* Build the message */
             buffer[0] = (uint8_t)Smsgs_cmdIds_genericReq;
 
             sendMsg(Smsgs_cmdIds_genericReq, item.devInfo.shortAddress,
                     item.capInfo.rxOnWhenIdle,
                     SMSGS_GENERIC_REQUEST_MSG_LEN,
                     buffer);
 
             status = Collector_status_success;
         }
         else
         {
             status = Collector_status_deviceNotFound;
         }
     }
 
     return(status);
 }
 ```

 ## collector.h

 In the `collector.h` file, add the new `Collector_sendGenericRequest()` function definition. 

```h
 /*!
 * @brief Build and send the generic message to a device.
 *
 * @param pDstAddr - destination address of the device to send the message
 *
 * @return Collector_status_success, Collector_status_invalid_state
 *         or Collector_status_deviceNotFound
 */
extern Collector_status_t Collector_sendGenericRequest(
    ApiMac_sAddr_t *pDstAddr);
```

## appsrv.c

Let's add the parsed generic sensor data to a buffer. This buffer will be used to read the data in JavaScript on the `iot-gateway` application side. 

```c
static void appsrv_deviceSensorData_common(ApiMac_sAddr_t *pSrcAddr,
                                           int8_t rssi,
                                           Smsgs_sensorMsg_t *pDataMsg,
                                           Smsgs_configRspMsg_t *pRspMsg)
{
    ...
    ...
    if(pDataMsg->frameControl & Smsgs_dataFields_humiditySensor)
            {
                len += 4;
                *pBuff++ = (uint8_t)(pDataMsg->humiditySensor.temp & 0xFF);
                *pBuff++ = (uint8_t)((pDataMsg->humiditySensor.temp >> 8) & 0xFF);
                *pBuff++ = (uint8_t)(pDataMsg->humiditySensor.humidity & 0xFF);
                *pBuff++ = (uint8_t)((pDataMsg->humiditySensor.humidity >> 8) & 0xFF);
            }
    if(pDataMsg->frameControl & Smsgs_dataFields_genericSensor)
            {
                len += 2;
                *pBuff++ = (uint8_t)(pDataMsg->genericSensor.genericRawData & 0xFF);
                *pBuff++ = (uint8_t)((pDataMsg->genericSensor.genericRawData >> 8) & 0xFF);
            }
...
...
```
The `appsrv.c` file will also handle in incoming requests from the `iot-gateway` application and initiate the appropriate function. 

First define the generic request and response command IDs.

```c
typedef enum smgsCmdIds{
    SMGS_CONFIG_REQ = 1,
    SMGS_CONFIG_RSP = 2,
    SMGS_TRACKING_REQ = 3,
    SMGS_TRACKING_RSP = 4,
    SMGS_SENSOR_DATA = 5,
    SMGS_TOGGLE_REQ = 6,
    SMGS_TOGGLE_RSP = 7,
    SMGS_GENERIC_REQ = 12,
    SMGS_GENERIC_RSP = 13
}Smgs_Cmd_Ids_t;
```

If the generic command request value is received from the `iot-gateway`, call the function to send the generic command to the corresponding sensor. 

```c
static void appsrv_processTxDataReq(struct appsrv_connection *pCONN, struct mt_msg *pIncomingMsg)
{
    ...
    ...
    else if(msgId == SMGS_TOGGLE_REQ)
    {
        LOG_printf(LOG_APPSRV_MSG_CONTENT, " Toggle-req received\n");
        Csf_sendToggleLedRequest(&pDstAddr);
    }

    else if(msgId == SMGS_GENERIC_REQ)
    {
        LOG_printf(LOG_APPSRV_MSG_CONTENT, " Generic-req received\n");
        Csf_sendGenericRequest(&pDstAddr);
    }

    status = ApiMac_status_success;
    send_AppsrvTxDataCnf(status);
}
```

## csf_linux.c

The `csf_linux.c` file is responsible for calling the sending of the generic command request. 

```c
...
...
/*!
 The appsrv module calls this function to send a led toggle request
 to a device over the air

 Public function defined in csf_linux.h
 */
extern uint8_t Csf_sendToggleLedRequest(
                ApiMac_sAddr_t *pDstAddr)
{
    return Collector_sendToggleLedRequest(pDstAddr);
}

/*!
 The appsrv module calls this function to send a generic request
 to a device over the air

 Public function defined in csf_linux.h
 */
 extern uint8_t Csf_sendGenericRequest(
    ApiMac_sAddr_t *pDstAddr)
{
return Collector_sendGenericRequest(pDstAddr);
}
...
...
```

## csf_linux.h

The header file needs to have the `Csf_sendGenericRequest()` function added. 

```h
/*!
 * @brief Build and send the generic message to a device.
 *
 * @param pDstAddr - destination address of the device to send the message
 *
 * @return Collector_status_success, Collector_status_invalid_state
 *         or Collector_status_deviceNotFound
 */
extern uint8_t Csf_sendGenericRequest(
    ApiMac_sAddr_t *pDstAddr);
```

---

## Modify the IOT-Gateway Application to add the Generic Sensor

Second, we need to modify the JavaScript based IOT-Gateway application to display data and handle requests to the web application. Navigate to the `/tutorial/SensorToCloud/example/iot-gateway/` folder and make changes/additions to the following files. 

## appClient/appclient.js

In the `appclient.js` file, we will extract the generic sensor value from the incoming data buffer.

First, define the genericSensor frame control value. 

```js
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
```

Then, cycle through the data buffer based on the frame control and save the data to the generic sensor data field. 

```js
function appC_processDeviceDataRxIndMsg(data){
        ...
        ...
        /* Humididty sensor data received */
        if(deviceData.sDataMsg.frameControl & Smsgs_dataFields.humiditySensor){
            deviceData.sDataMsg.humiditySensor = {};
            deviceData.sDataMsg.humiditySensor.temp = data.readUint16(ind);
            ind += 2;
            deviceData.sDataMsg.humiditySensor.humidity = data.readUint16(ind);
            ind += 2;
        }
        /* Generic sensor data received */
        if(deviceData.sDataMsg.frameControl & Smsgs_dataFields.genericSensor){
            deviceData.sDataMsg.genericSensor = {};
            deviceData.sDataMsg.genericSensor.genericRawData = data.readUint16(ind);
            ind += 2;
        }
            ...
            ...
```

The `appclient.js` file is also responsible for sending commands to the `collector`.  

First define the generic command values. 

```js
var smgsCmdIds = Object.freeze({
    CONFIG_REQ: 1,
    CONFIG_RSP: 2,
    TRACKING_REQ: 3,
    TRACKING_RSP: 4,
    SENSOR_DATA: 5,
    TOGGLE_REQ: 6,
    TOGGLE_RSP: 7,
    GENERIC_REQ: 12,
    GENERIC_RSP: 13
});
```

Define the function that will be used to send the generic commands to the app server. 

```js
function appC_setJoinPermitAtAppServer(data) {
    ...
    ...
    /*!
	* @brief        Allows send generic command to a network device
	*
	* @param 		none
	*
	* @return       none
	*/
    Appclient.prototype.appC_sendGeneric = function (data) {
        appC_sendGenericMsgToAppServer(data);
    }
    ...
    ...
```

In the actual sending of the command, need to construct the message and send that message to the `collector`. 

```js
function Appclient() {
    ...
    ...
 /*!
* @brief        Send Generic req message to application server
*
* @param 		data - Contains device address to send req to
*
* @return       none
*/
function appC_sendGenericMsgToAppServer(data) {
    //Find index of ext address
    var dstAddr = data.dstAddr.substring(2);

    var deviceIdx = findDeviceIndexShortAddr(dstAddr);
    if (deviceIdx == -1){
        deviceIdx = findDeviceIndexExtAddr(dstAddr);
    }
    if(deviceIdx != -1){
        var len = 5;
        var msg_buf = new ByteBuffer(PKT_HEADER_SIZE + len, ByteBuffer.LITTLE_ENDIAN);
        msg_buf.writeShort(len, PKT_HEADER_LEN_FIELD);
        msg_buf.writeUint8(APPSRV_SYS_ID_RPC, PKT_HEADER_SUBSYS_FIELD);
        msg_buf.writeUint8(cmdIds.TX_DATA_REQ, PKT_HEADER_CMDID_FIELD);
        var ind = PKT_HEADER_SIZE;
        msg_buf.writeUint8(smgsCmdIds.GENERIC_REQ, ind);
        ind+=1;
        msg_buf.writeUint16(self.connectedDeviceList[deviceIdx].shortAddress, ind);

        appClient.write(msg_buf.buffer);
        if(PRINT_DEBUG) console.log("Sent Generic request");
    }
}
...
...
}
```

## appClient/devices/device.js

In the `device.js` file, we will be updating the smart object values to correspond to the new data received. 

As before, define the frame control value of the generic sensor. 

```js
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
```

If the generic sensor is in the current frame control, update the generic raw data sensor smart object to have the new generic data received from the sensor. 

```js
/* Prototype Functions */
Device.prototype.rxSensorData = function (sensorData) {
    ...
    ...
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
    ...
    ...
```

Initialize the device to have a generic sensor. 

```js
Device.prototype.rxConfigRspInd = function (devConfigData) {
    ...
    ...
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
    ...
    ...
```

## webserver/collectorApp.html

The `collectorApp.html` generates the look and control of the Sensor To Cloud app. Here we will add the display of the generic sensor to the app table. We will also add a generic button that will be used to send a generic command to a sensor. 

First, lets add the generic sensor raw data value to the sensor node table. If the `genericrawdata` smart object is available, we will add a row to the sensors. We will then print the latest value of the generic sensor. 

```js
function collectorApp_updateNwkInfo(data) {
        ...
        ...
        if (devInfo.smart_objects.hasOwnProperty('illuminance')) {
            sensorDataFound  = 1
            sensorS += '<tr><td><img src="dist/images/Light.png " alt="some_text" height="30" width="30"></td><td>' + devInfo.smart_objects.illuminance[0].sensorValue + ' lux </td></tr>';
        }

        if (devInfo.smart_objects.hasOwnProperty('genericrawdata')) {
            sensorDataFound  = 1;
            sensorS += '<tr><td></td><td>' + devInfo.smart_objects.genericrawdata[0].sensorValue + ' rawData </td></tr>';
        }
        ...
        ...
```

Modify each row of the table to include a generic button with a class called `genericbutton`. 

```js
function collectorApp_updateNwkInfo(data) {
        ...
        ...
            sensorS += '</table>';

            /* add/update device information */
            $deviceTable.prepend('<tr><td><table class="table table-responsive"><tr><td>SAddr: 0x' + sAddr.toString(16) + '</td></tr><tr  class="ieee"><td>ExAddr: 0x' + extAddr.toString(16).toUpperCase() + '</td></tr><tr><td>RSSI: ' + rssi + ' dBm</td></tr></table></td><td>' + sensorS + '</td>><td>' + "<p button type=button class='test btn btn-default'>Red LED" + "</p>" + "<p button type=button class='genericbutton btn btn-default'>Generic" + "</p>" +'</td></tr>');
        ...
        ...
```

When the Generic Button is pressed, first we need to determine which sensor we want to send a generic command to. Based on which row of the table was clicked, we can look up the short address of the device we want to send the command to. Then emit the `sendGeneric` command along with the short address. 

```js
...
...
$deviceTable.on("click", "p.test", function(){
    let data = $(this).closest('tr').find('td:first').text();
    let n = data.indexOf("ExAddr");
    let m = data.indexOf("0x");
    var shortAddr = data.substring((m),(n));
    console.log(shortAddr);
    socket.emit('sendToggle', {dstAddr: shortAddr});
});

$deviceTable.on("click", "p.genericbutton", function(){
    let data = $(this).closest('tr').find('td:first').text();
    let n = data.indexOf("ExAddr");
    let m = data.indexOf("0x");
    var shortAddr = data.substring((m),(n));
    console.log(shortAddr);
    socket.emit('sendGeneric', {dstAddr: shortAddr});
});
...
...
```


## webserver/webserver.js

The `webserver.js` application will receive commands from the web application and forward it to the gateway. 

When we get the `sendGeneric` command from the webserver, forward this message to the iot-gateway. 

```js
function Webserver() {
    ...
    ...
    socket.on('sendToggle', function (data) {
        webserverInstance.emit('sendToggle', data);
    });

    socket.on('sendGeneric', function (data) {
        webserverInstance.emit('sendGeneric', data);
    });

});
```

## iot-gateway.js

The `iot-gateway.js` file is responsible for initializing functions that are sent from the webserver application and are to be forwarded to the C based `collector` application.

Here, when we get the request to send a generic command from the web app, we will call the `collector` application to send the actual generic command to the appropriate sensor. 

```js
function Gateway() {
...
...
	/* rcvd send toggle req */
	cloudAdapter.on('sendToggle', function (data) {
		/* send toggle request */
		appClient.appC_sendToggle(data);
	});

	/* rcvd send generic req */
	cloudAdapter.on('sendGeneric', function (data) {
		/* send generic request */
		appClient.appC_sendGeneric(data);
	});
...
...
```

If you were able to follow all of the steps correctly, you should now be able to build and start the Linux Collector and the Local Gateway. 

---

## Run the Sensor To Cloud gateway with Generic Sensor

Copy this `/tutorial` folder that you have been modifying to your Linux machine if you have not done so already.

## Start Linux Collector
1. Copy the `/tutorial/` folder to the Linux machine. 
2. Open a terminal and navigate to the collector folder `../tutorial/SensorToCloud/`
3. Build all the necessary files for the project. 
    - `sudo ./build_all.sh`
4. Navigate to the collector folder `../tutorial/SensorToCloud/example/collector/`
5. Build the collector C project by running the following command.
    - `sudo make clean`
    - `sudo make host`
6. Connect the CC1310 LaunchPad running the `coprocessor_cc1310lp` project to the Linux machine via USB. 
    - If you are using a Virtual Machine, you must connect the LaunchPad device to the Virtual Machine. 
7. Check what serial port the CC1310 LaunchPad is connected to by running the following command. 
    - `ls -l /dev/ttyACM*`
8. The collector application is configured to look at `/dev/ttyACM0` by default. If the previous command did not return a device is connected to `/dev/ttyACM0` and `/dev/ttyACM1`, the port needs to be changed in the `collector.cfg` file. 
    - To change the COM port, edit the `devname` parameter in the `/tutorial/SensorToCloud/example/collector/collector.cfg` file. Save all changes. 
9. Run the `run_collector.sh` file that was generated during the build by running the following command in the `/tutorial/SensorToCloud/example/collector` folder. 
    - `sudo ./run_collector.sh collector.cfg`
10. If successful, the Linux Collector will detect the "coprocessor" and then run in the background. 
    - If it failed, try running the command again. Make sure CC1310 LaunchPad is on the proper port defined in the `collector.cfg` file. 

## Start Local Gateway Application
1. Open a new terminal and navigate to the `../tutorial/SensorToCloud/example/iot-gateway` folder.
2. Install the necessary Node packages by running the following command. 
    - `npm install`
3. After all the necessary node modules have been installed, run the gateway by entering the following command. 
    - `node iot-gateway.js localhost`
4. In a web browser, navigate to your "localhost" address, port 1350.
    - `http://localhost:1350/`
5. If successful, you will see the "TI 15.4-Stack Linux Gateway Example Application" appear. 

## Connecting Sensor to Local Gateway Application
1. Click the `Open` button on the left hand side to allow devices to connect to the network. 
2. The CC1310 LaunchPad running the `sensor_generic_cc1310lp` project should then connect to the network and appear in the application table. 
    - If the sensor does not connect and appear, attempt to RESET or reflash the Sensor LaunchPad device and try again. 

## Using the Generic Sensor Function
1. The generic sensor will send a value that corresponds to the number of times BTN-2 on the Sensor LaunchPad is pressed. (each time BTN-2 is pressed, the generic sensor value is incremented)
2. The generic sensor button on the gateway application will send a command to the corresponding sensor to print "Hello from Sensor To Cloud Gateway" to a terminal. 
3. On Windows:
    - To start a COM terminal with the Sensor LaunchPad, first connect the sensor LaunchPad to the Windows machine via USB. 
    - Open "Device Manager" and determine the COM port the LaunchPad is connected to. 
    - Using a program such as PuTTY, start a "Serial" terminal session on the determined COM port.  