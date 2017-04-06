/******************************************************************************
 @file smsgs_proto.h

 @brief TIMAC 2.0 API TIMAC 2.0 - These convert smsgs.h structures to protobuf form

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
 $Release Name: TI-15.4Stack Linux x64 SDK ENG$
 $Release Date: Mar 08, 2017 (2.01.00.10)$
 *****************************************************************************/

#if !defined(SMSGS_PROTO_H)
#define SMGS_PROTO_H

#include "smsgs.h"
#include "smsgs.pb-c.h"

/*!
 * @brief Copy sensor config response to protobuf form
 * @param pConfigRsp - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsConfigRspMsg *copy_Smsgs_configRspMsg(
    const Smsgs_configRspMsg_t *pConfigRspMsg);

/*!
 * @brief release memory for protobuf form of sensor config response.
 * @param pThis - data to free
 */
void free_SmsgsConfigRspMsg(SmsgsConfigRspMsg *pThis);

/*!
 * @brief Release memory for a sensor message
 * @param pThis - data to free
 */
void free_SmsgsSensorMsg(SmsgsSensorMsg *pThis);

/*!
 * @brief Convert a sensor message
 * @param pSensormsg - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsSensorMsg *copy_Smsgs_sensorMsg(const Smsgs_sensorMsg_t *pSensorMsg);

/*!
 * @brief Release memory for a config message
 * @param pThis - data to free
 */
void free_SmsgsConfigSettingsField(SmsgsConfigSettingsField *pThis);

/*!
 * @brief Release memory for a humidity message
 * @param pThis - data to free
 */
void free_SmsgsHumiditySensorField(SmsgsHumiditySensorField *pThis);

/*!
 * @brief Release memory for a light sensor message
 * @param pThis - data to free
 */
void free_SmsgsLightSensorField(SmsgsLightSensorField *pThis);

/*!
 * @brief Release memory for a msg status message
 * @param pThis - data to free
 */
void free_SmsgsMsgStatsField(SmsgsMsgStatsField *pThis);

/*!
 * @brief Release memory for a temp message
 * @param pThis - data to free
 */
void free_SmsgsTempSensorField(SmsgsTempSensorField *pThis);

/*!
 * @brief Release memory for a pressure message
 * @param pThis - data to free
 */
void free_SmsgsPressureSensorField(SmsgsPressureSensorField *pThis);

/*!
 * @brief Release memory for a motion message
 * @param pThis - data to free
 */
void free_SmsgsMotionSensorField(SmsgsMotionSensorField *pThis);

/*!
 * @brief Release memory for a battery message
 * @param pThis - data to free
 */
void free_SmsgsBatterySensorField(SmsgsBatterySensorField *pThis);

/*!
 * @brief convert a config setting message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsConfigSettingsField *copy_Smsgs_configSettingsField(
    const Smsgs_configSettingsField_t *pThis);

/*!
 * @brief convert a config humidity message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsHumiditySensorField *copy_Smsgs_humiditySensorField(
    const Smsgs_humiditySensorField_t *pThis);

/*!
 * @brief convert a config light message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsLightSensorField *copy_Smsgs_lightSensorField(
    const Smsgs_lightSensorField_t *pThis);

/*!
 * @brief convert a config msg stats message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsMsgStatsField *copy_Smsgs_msgStatsField(
    const Smsgs_msgStatsField_t *pThis);

/*!
 * @brief convert a config temp message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsTempSensorField *copy_Smsgs_tempSensorField(
    const Smsgs_tempSensorField_t *pThis);

/*!
 * @brief convert pressure message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsPressureSensorField *copy_Smsgs_pressureSensorField(
    const Smsgs_pressureSensorField_t *pThis);

/*!
 * @brief convert motion message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsMotionSensorField *copy_Smsgs_motionSensorField(
    const Smsgs_motionSensorField_t *pThis);

/*!
 * @brief convert battery message
 * @param pThis - data to convert to the protobuf format
 * @returns data in protobuf format
 */
SmsgsBatterySensorField *copy_Smsgs_batterySensorField(
    const Smsgs_batterySensorField_t *pThis);


#endif

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

