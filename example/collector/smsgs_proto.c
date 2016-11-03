/******************************************************************************
 @file smsgs_proto.c

 @brief TIMAC 2.0 API Manage smsgs.h structures to protobuf conversion

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

#include "malloc.h"
#include "api_mac.h"
#include "api_mac.pb-c.h"

#include "log.h"

#include "llc.h"
#include "csf.h"
#include "csf_linux.h"
#include "csf_proto.h"
#include "llc.pb-c.h"
#include "llc_proto.h"
#include "smsgs.h"
#include "smsgs_proto.h"
#include "api_mac_proto.h"
#include "appsrv_proto.h"

#include "malloc.h"

/* Release memory for a config settings field.
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsConfigSettingsField(SmsgsConfigSettingsField *pThis)
{
    if(pThis)
    {
        free((void *)(pThis));
    }
}

/* Free memory for a humidity field.
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsHumiditySensorField(SmsgsHumiditySensorField *pThis)
{
    if(pThis)
    {
        free((void *)(pThis));
        pThis = NULL;
    }
}

/* Free memory for a light sensor field.
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsLightSensorField(SmsgsLightSensorField *pThis)
{
    if(pThis)
    {
        free((void *)(pThis));
        pThis = NULL;
    }
}

/* Free memory for a msg stats field.
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsMsgStatsField(SmsgsMsgStatsField *pThis)
{
    if(pThis)
    {
        free((void *)(pThis));
        pThis = NULL;
    }
}

/* Free memory for a msg stats field.
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsTempSensorField(SmsgsTempSensorField *pThis)
{
    if(pThis)
    {
        free((void *)(pThis));
        pThis = NULL;
    }
}

/* Convert settings field to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsConfigSettingsField *copy_Smsgs_configSettingsField(
    const Smsgs_configSettingsField_t *pThis)
{
    SmsgsConfigSettingsField *pResult;

    pResult = calloc(1, sizeof(*pResult));
    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsConfigSettingsField\n");
    }
    else
    {
        smsgs_config_settings_field__init(pResult);
        pResult->reportinginterval      = pThis->reportingInterval;
        pResult->pollinginterval        = pThis->pollingInterval;
    }
    return pResult;
}

// Suyash
SmsgsPressureSensorField *copy_Smsgs_pressureSensorField(const Smsgs_pressureSensorField_t *pThis)
{
    SmsgsPressureSensorField *pResult;

    pResult = calloc(1, sizeof(*pResult));
    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsPressureSensorField\n");
    }
    else
    {
        smsgs_pressure_sensor_field__init(pResult);
        pResult->tempvalue      = pThis->tempValue;
        pResult->pressurevalue  = pThis->pressureValue;
    }
    return pResult;
}

/* Convert humidity field to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsHumiditySensorField *copy_Smsgs_humiditySensorField(
    const Smsgs_humiditySensorField_t *pThis)
{
    SmsgsHumiditySensorField *pResult;

    pResult = calloc(1, sizeof(*pResult));
    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsHumiditySensorField\n");
    }
    else
    {
        smsgs_humidity_sensor_field__init(pResult);
        pResult->temp           = pThis->temp;
        pResult->humidity           = pThis->humidity;
    }
    return pResult;
}

/* Convert humidity field to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsLightSensorField *copy_Smsgs_lightSensorField(
    const Smsgs_lightSensorField_t *pThis)
{
    SmsgsLightSensorField *pResult;

    pResult = calloc(1,sizeof(*pResult));
    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsLightSensorField\n");
    }
    else
    {
        smsgs_light_sensor_field__init(pResult);
        pResult->rawdata            = pThis->rawData;
    }
    return pResult;
}

/* Convert msg stats field to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsMsgStatsField *copy_Smsgs_msgStatsField(
    const Smsgs_msgStatsField_t *pThis)
{
    SmsgsMsgStatsField *pResult;

    pResult = calloc(1,sizeof(*pResult));
    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsMsgStatsField\n");
    }
    else
    {
        smsgs_msg_stats_field__init(pResult);
        pResult->joinattempts       = pThis->joinAttempts;
        pResult->joinfails          = pThis->joinFails;
        pResult->msgsattempted      = pThis->msgsAttempted;
        pResult->msgssent           = pThis->msgsSent;
        pResult->trackingrequests       = pThis->trackingRequests;
        pResult->trackingresponseattempts   = pThis->trackingResponseAttempts;
        pResult->channelaccessfailures  = pThis->channelAccessFailures;
        pResult->macackfailures     = pThis->macAckFailures;
        pResult->otherdatarequestfailures   = pThis->otherDataRequestFailures;
        pResult->synclossindications    = pThis->syncLossIndications;
    }
    return pResult;
}

/* Convert temp sensor field to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsTempSensorField *copy_Smsgs_tempSensorField(
    const Smsgs_tempSensorField_t *pThis)
{
    SmsgsTempSensorField *pResult;

    pResult = calloc(1, sizeof(*pResult));

    if(!pResult)
    {
        LOG_printf(LOG_ERROR, "No memory for: SmsgsTempSensorField\n");
    }
    else
    {
        smsgs_temp_sensor_field__init(pResult);
        pResult->ambiencetemp       = pThis->ambienceTemp;
        pResult->objecttemp         = pThis->objectTemp;
    }
    return pResult;
}

/* Convert a sensor message to protobuf form
 * Public function defined in smsgs_proto.h
 */
SmsgsSensorMsg *copy_Smsgs_sensorMsg(const Smsgs_sensorMsg_t *pSensorMsg)
{
    bool fail;
    SmsgsSensorMsg *pResult;

    pResult = (SmsgsSensorMsg *)calloc(1,sizeof(*pResult));
    if(pResult == NULL)
    {
        goto _fail;
    }

    smsgs_sensor_msg__init(pResult);

    fail = false;

    pResult->cmdid = pSensorMsg->cmdId;

    pResult->framecontrol = pSensorMsg->frameControl;

    if(pSensorMsg->frameControl & Smsgs_dataFields_tempSensor)
    {
        pResult->tempsensor     =
            copy_Smsgs_tempSensorField(&(pSensorMsg->tempSensor));
        if(pResult->tempsensor == NULL)
        {
            fail = true;
        }
    }

    if(pSensorMsg->frameControl & Smsgs_dataFields_lightSensor)
    {
        pResult->lightsensor    =
            copy_Smsgs_lightSensorField(&(pSensorMsg->lightSensor));
        if(pResult->lightsensor == NULL)
        {
            fail = true;
        }
    }
    if(pSensorMsg->frameControl & Smsgs_dataFields_humiditySensor)
    {
        pResult->humiditysensor =
            copy_Smsgs_humiditySensorField(&(pSensorMsg->humiditySensor));
        if(pResult->humiditysensor == NULL)
        {
            fail = true;
        }
    }

    if(pSensorMsg->frameControl & Smsgs_dataFields_msgStats)
    {
        pResult->msgstats       =
            copy_Smsgs_msgStatsField(&(pSensorMsg->msgStats));
        if(pResult->msgstats == NULL)
        {
            fail = true;
        }
    }

    if(pSensorMsg->frameControl & Smsgs_dataFields_configSettings)
    {
        pResult->configsettings =
            copy_Smsgs_configSettingsField(&(pSensorMsg->configSettings));
        if(pResult->configsettings == NULL)
        {
            fail = true;
        }
    }
    if(pSensorMsg->frameControl & Smsgs_dataFields_pressureSensor)
    {
        pResult->pressuresensor =
        copy_Smsgs_pressureSensorField(&(pSensorMsg->pressureSensor));
        if(pResult->pressuresensor == NULL)
        {
            fail = true;
        }
    }
    if(fail)
    {
    _fail:
        LOG_printf(LOG_ERROR,"No memory for SmsgsSensorMsg\n");
        free_SmsgsSensorMsg(pResult);
        pResult = NULL;
    }
    return pResult;
}

/* release memory for a sensor message to protobuf form
 * Public function defined in smsgs_proto.h
 */
void free_SmsgsSensorMsg(SmsgsSensorMsg *pThis)
{
    if(pThis == NULL)
    {
        return;
    }

    if(pThis->tempsensor)
    {
        free_SmsgsTempSensorField(pThis->tempsensor);
        pThis->tempsensor = NULL;
    }

    if(pThis->lightsensor)
    {
        free_SmsgsLightSensorField(pThis->lightsensor);
        pThis->lightsensor = NULL;
    }

    if(pThis->humiditysensor)
    {
        free_SmsgsHumiditySensorField(pThis->humiditysensor);
        pThis->humiditysensor = NULL;
    }

    if(pThis->msgstats)
    {
        free_SmsgsMsgStatsField(pThis->msgstats);
        pThis->msgstats = NULL;
    }

    if(pThis->configsettings)
    {
        free_SmsgsConfigSettingsField(pThis->configsettings);
        pThis->configsettings = NULL;
    }
    free( (void *)(pThis) );
}

/* convert sensor config response message
 * Public function in smsgs_proto.h
 */
SmsgsConfigRspMsg *copy_Smsgs_configRspMsg(
    const Smsgs_configRspMsg_t *pConfigRspMsg)
{
    SmsgsConfigRspMsg *pDATA;

    pDATA = calloc(1, sizeof(*pDATA));
    if(pDATA == NULL)
    {
        LOG_printf(LOG_ERROR, "no memory for SmsgsConfigRspMsg\n");
        return NULL;
    }

    smsgs_config_rsp_msg__init(pDATA);

    pDATA->cmdid = pConfigRspMsg->cmdId;
    pDATA->framecontrol = pConfigRspMsg->frameControl;
    pDATA->pollinginterval = pConfigRspMsg->pollingInterval;
    pDATA->treportinginterval = pConfigRspMsg->reportingInterval;
    pDATA->status = pConfigRspMsg->status;
    return pDATA;
}

/* Free sensor config response message
 * Public function in smsgs_proto.h
 */
void free_SmsgsConfigRspMsg(SmsgsConfigRspMsg *pThis)
{
    if(pThis)
    {
        free(pThis);
    }
}

/*
 *  ========================================
 *  Texas Instruments Micro Controller Style
 *  ========================================
 *  Local Variables:
 *  mode: c
 *  c-file-style: "bsd"
 *  tab-width: 4
 *  c-basic-offset: 4
 *  indent-tabs-mode: nil
 *  End:
 *  vim:set  filetype=c tabstop=4 shiftwidth=4 expandtab=true
 */

