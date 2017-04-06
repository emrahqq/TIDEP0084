/******************************************************************************

 @file config.h

 @brief TI-15.4 Stack configuration parameters for Collector applications

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
#ifndef CONFIG_H
#define CONFIG_H

/******************************************************************************
 Includes
 *****************************************************************************/

#ifdef __cplusplus
extern "C"
{
#endif

/******************************************************************************
 Constants and definitions
 *****************************************************************************/
/* config parameters */

/*
   NOTE ABOUT CONFIGURATION PARAMTERS
   ----------------------------------
   In the embedded device, these are hard coded configuration items
   In the Linux impimentation the are configurable in 2 ways.
   Method #1 via hard coding with the _DEFAULT value.
   Method #2 via the "appsrv.cfg" configuration file.
   This "extern bool" hidden via the macro exists to facilitate
   the linux configuration scheme.
 */

/*! Should the newtwork auto start or not? */
extern bool linux_CONFIG_AUTO_START;
#define CONFIG_AUTO_START   linux_CONFIG_AUTO_START
#define CONFIG_AUTO_START_DEFAULT true

/*! Security Enable - set to true to turn on security */
extern bool linux_CONFIG_SECURE;
#define CONFIG_SECURE                linux_CONFIG_SECURE
#define CONFIG_SECURE_DEFAULT        true
/*! PAN ID */
extern int linux_CONFIG_PAN_ID;
#define CONFIG_PAN_ID                ((uint16_t)(linux_CONFIG_PAN_ID))
#define CONFIG_PAN_ID_DEFAULT        0xffff

/*! Coordinator short address */
extern int linux_CONFIG_COORD_SHORT_ADDR;
#define CONFIG_COORD_SHORT_ADDR      ((uint16_t)(linux_CONFIG_COORD_SHORT_ADDR))
#define CONFIG_COORD_SHORT_ADDR_DEFAULT 0xAABB
/*! FH disabled as default */

extern bool linux_CONFIG_FH_ENABLE;
#define CONFIG_FH_ENABLE             linux_CONFIG_FH_ENABLE
#define CONFIG_FH_ENABLE_DEFAULT     false

/*! maximum beacons possibly received */
#define CONFIG_MAX_BEACONS_RECD      200
/*! link quality */
extern uint8_t linux_CONFIG_LINKQUALITY;
#define CONFIG_LINKQUALITY           linux_CONFIG_LINKQUALITY
#define CONFIG_LINKQUALITY_DEFAULT  1

/*! percent filter */
extern uint8_t linux_CONFIG_PERCENTFILTER;
#define CONFIG_PERCENTFILTER         linux_CONFIG_PERCENTFILTER
#define CONFIG_PERCENTFILTER_DEFAULT 0xFF

/*! maximum devices in association table */
#define CONFIG_MAX_DEVICES           50

/*!
 Setting beacon order to 15 will disable the beacon, 8 is a good value for
 beacon mode
 */
extern int linux_CONFIG_MAC_BEACON_ORDER;
#define CONFIG_MAC_BEACON_ORDER      linux_CONFIG_MAC_BEACON_ORDER
#define CONFIG_MAC_BEACON_ORDER_DEFAULT 15

/*!
 Setting superframe order to 15 will disable the superframe, 6 is a good value
 for beacon mode
 */
extern int linux_CONFIG_MAC_SUPERFRAME_ORDER;
#define CONFIG_MAC_SUPERFRAME_ORDER  linux_CONFIG_MAC_SUPERFRAME_ORDER
#define CONFIG_MAC_SUPERFRAME_ORDER_DEFAULT 15

/*! Setting for Phy ID */
extern int linux_CONFIG_PHY_ID;
#define CONFIG_PHY_ID (linux_CONFIG_PHY_ID)
#define CONFIG_PHY_ID_DEFAULT                (APIMAC_STD_US_915_PHY_1)

/*! Setting for channel page */
extern int linux_CONFIG_CHANNEL_PAGE ;
#define CONFIG_CHANNEL_PAGE                  linux_CONFIG_CHANNEL_PAGE

#if ((CONFIG_PHY_ID_DEFAULT >= APIMAC_MRFSK_STD_PHY_ID_BEGIN) && (CONFIG_PHY_ID_DEFAULT <= APIMAC_MRFSK_STD_PHY_ID_END))
#define CONFIG_CHANNEL_PAGE_DEFAULT          (APIMAC_CHANNEL_PAGE_9)
#elif ((CONFIG_PHY_ID_DEFAULT >= APIMAC_MRFSK_GENERIC_PHY_ID_BEGIN) && (CONFIG_PHY_ID_DEFAULT <= APIMAC_MRFSK_GENERIC_PHY_ID_END))
#define CONFIG_CHANNEL_PAGE_DEFAULT          (APIMAC_CHANNEL_PAGE_10)
#else
#error "PHY ID is wrong."
#endif

/*! scan duration */
extern uint8_t linux_CONFIG_SCAN_DURATION;
#define CONFIG_SCAN_DURATION         linux_CONFIG_SCAN_DURATION

#if ((CONFIG_PHY_ID_DEFAULT >= APIMAC_MRFSK_STD_PHY_ID_BEGIN) && (CONFIG_PHY_ID_DEFAULT <= APIMAC_MRFSK_GENERIC_PHY_ID_BEGIN))
#define CONFIG_SCAN_DURATION_DEFAULT 5
#elif ((CONFIG_PHY_ID_DEFAULT >= APIMAC_MRFSK_GENERIC_PHY_ID_BEGIN + 1) && (CONFIG_PHY_ID_DEFAULT <= APIMAC_MRFSK_GENERIC_PHY_ID_END))
#define CONFIG_SCAN_DURATION_DEFAULT 9
#else
#error "PHY ID is wrong."
#endif

extern int linux_CONFIG_RANGE_EXT_MODE;
#define CONFIG_RANGE_EXT_MODE linux_CONFIG_RANGE_EXT_MODE
/*!
 Range Extender Mode setting.
 The following modes are available.
 APIMAC_NO_EXTENDER - does not have PA/LNA
 APIMAC_HIGH_GAIN_MODE - high gain mode
 To enable CC1190, use
 #define CONFIG_RANGE_EXT_MODE_DEFAULT       APIMAC_HIGH_GAIN_MODE
*/
#define CONFIG_RANGE_EXT_MODE_DEFAULT       APIMAC_NO_EXTENDER

/*! Setting Default Key*/
#define KEY_TABLE_DEFAULT_KEY \
    {0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,                    \
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
/*!
 Channel mask used when CONFIG_FH_ENABLE is false.
 Each bit indicates if the corresponding channel is to be scanned
 First byte represents channels 0 to 7 and the last byte represents
 channels 128 to 135.
 For byte zero in the bit mask, LSB representing Ch0.
 For byte 1, LSB represents Ch8 and so on.
 e.g., 0x01 0x10 represents Ch0 and Ch12 are included.
 The default of 0x0F represents channels 0-3 are selected.
 APIMAC_STD_US_915_PHY_1 (50kbps/2-FSK/915MHz band) has channels 0 - 128.
 APIMAC_STD_ETSI_863_PHY_3 (50kbps/2-FSK/863MHz band) has channels 0 - 33.

 NOTE:
    In the linux impliementation the INI file parser callback
    uses a a function to *clear/zero* the mask, and another
    function to set various bits within the channel mask.
 */
extern uint8_t linux_CONFIG_CHANNEL_MASK[APIMAC_154G_CHANNEL_BITMAP_SIZ];
#define CONFIG_CHANNEL_MASK_DEFAULT   { 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, \
                                        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, \
                                        0x00, 0x00, 0x00, 0x00, 0x00 }
/*!
 Channel mask used when CONFIG_FH_ENABLE is true.
 Represents the list of channels on which the device can hop.
 The actual sequence used shall be based on DH1CF function.
 It is represented as a bit string with LSB representing Ch0.
 e.g., 0x01 0x10 represents Ch0 and Ch12 are included.
 */
extern uint8_t linux_CONFIG_FH_CHANNEL_MASK[APIMAC_154G_CHANNEL_BITMAP_SIZ]; 
#define CONFIG_FH_CHANNEL_MASK_DEFAULT { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, \
                                         0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, \
                                         0xFF, 0xFF, 0xFF, 0xFF, 0xFF }

/*!
 List of channels to target the Async frames
 It is represented as a bit string with LSB representing Ch0
 e.g., 0x01 0x10 represents Ch0 and Ch12 are included
 It should cover all channels that could be used by a target device in its
 hopping sequence. Channels marked beyond number of channels supported by
 PHY Config will be excluded by stack. To avoid interference on a channel,
 it should be removed from Async Mask and added to exclude channels
 (CONFIG_CHANNEL_MASK).
 */
extern uint8_t linux_FH_ASYNC_CHANNEL_MASK[APIMAC_154G_CHANNEL_BITMAP_SIZ];
#define FH_ASYNC_CHANNEL_MASK_DEFAULT                                   \
    { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,                               \
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,                         \
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF }

/* FH related config variables */
/*!
 The number of non sleepy end devices to be supported.
 It is to be noted that the total number of devices supported (sleepy/
 non sleepy) must be less than 50. Stack will allocate memory proportional
 to the number of end devices requested.
 */
extern int linux_FH_NUM_NON_SLEEPY_NEIGHBORS;
#define FH_NUM_NON_SLEEPY_NEIGHBORS  linux_FH_NUM_NON_SLEEPY_NEIGHBORS  
#define FH_NUM_NON_SLEEPY_NEIGHBORS_DEFAULT 0
/*!
 The number of sleepy end devices to be supported.
 It is to be noted that the total number of devices supported (sleepy/
 non sleepy) must be less than 50. Stack will allocate memory proportional
 to the number of end devices requested.
 */
extern int linux_FH_NUM_SLEEPY_NEIGHBORS;
#define FH_NUM_SLEEPY_NEIGHBORS  linux_FH_NUM_SLEEPY_NEIGHBORS
#define FH_NUM_SLEEPY_NEIGHBORS_DEFAULT 50

/*!
 Dwell time: The duration for which the collector will
 stay on a specific channel before hopping to next channel.
 */
extern int linux_CONFIG_DWELL_TIME;
#define CONFIG_DWELL_TIME            linux_CONFIG_DWELL_TIME
#define CONFIG_DWELL_TIME_DEFAULT    250

/*!
 The minimum trickle timer window for PAN Advertisement,
 and PAN Configuration frame transmissions.
 Recommended to set this to half of PAS/PCS MIN Timer
*/
extern int linux_CONFIG_TRICKLE_MIN_CLK_DURATION;
#define CONFIG_TRICKLE_MIN_CLK_DURATION    linux_CONFIG_TRICKLE_MIN_CLK_DURATION

/*!
 The maximum trickle timer window for PAN Advertisement,
 and PAN Configuration frame transmissions.
 */
extern int linux_CONFIG_TRICKLE_MAX_CLK_DURATION;
#define CONFIG_TRICKLE_MAX_CLK_DURATION    linux_CONFIG_TRICKLE_MAX_CLK_DURATION

#if ((CONFIG_PHY_ID_DEFAULT >= APIMAC_MRFSK_STD_PHY_ID_BEGIN) && (CONFIG_PHY_ID_DEFAULT <= APIMAC_MRFSK_GENERIC_PHY_ID_BEGIN))
#define CONFIG_TRICKLE_MIN_CLK_DURATION_DEFAULT 3000
#define CONFIG_TRICKLE_MAX_CLK_DURATION_DEFAULT 6000
#else
#define CONFIG_TRICKLE_MIN_CLK_DURATION_DEFAULT 30000
#define CONFIG_TRICKLE_MAX_CLK_DURATION_DEFAULT 60000
#endif

/* default value for PAN Size PIB */
extern int linux_CONFIG_FH_PAN_SIZE;
#define CONFIG_FH_PAN_SIZE             linux_CONFIG_FH_PAN_SIZE
#define CONFIG_FH_PAN_SIZE_DEFAULT     0x0032

/* To enable Doubling of PA/PC trickle time,
 * useful when network has non sleepy nodes and
 * thre is a requirement to use PA/PC to convey updated
 * PAN information */
extern bool linux_CONFIG_DOUBLE_TRICKLE_TIMER;
#define CONFIG_DOUBLE_TRICKLE_TIMER    linux_CONFIG_DOUBLE_TRICKLE_TIMER
#define CONFIG_DOUBLE_TRICKLE_TIMER_DEFAULT false

/*! value for ApiMac_FHAttribute_netName */
extern char linux_CONFIG_FH_NETNAME[32];
#define CONFIG_FH_NETNAME            linux_CONFIG_FH_NETNAME
#define CONFIG_FH_NETNAME_DEFAULT    {"FHTest"}

/*!
 Value for Transmit Power in dBm
 Default value is 14, allowed values are any value
 between 0 dBm and 14 dBm in 1 dB increments, and -10 dBm
 When the nodes in the network are close to each other
 lowering this value will help reduce saturation */
extern int linux_CONFIG_TRANSMIT_POWER;
#define CONFIG_TRANSMIT_POWER   linux_CONFIG_TRANSMIT_POWER
#if CONFIG_RANGE_EXT_MODE_DEFAULT
#define CONFIG_TRANSMIT_POWER_DEFAULT        27
#else
#define CONFIG_TRANSMIT_POWER_DEFAULT        14
#endif

/*!
* Enable this mode for certfication.
* For FH certification, CONFIG_FH_ENABLE should
* also be enabled.
*/
#define CERTIFICATION_TEST_MODE linux_CERTIFICATION_TEST_MODE
extern int linux_CERTIFICATION_TEST_MODE;
#define CERTIFICATION_TEST_MODE_DEFAULT false

extern int linux_CONFIG_POLLING_INTERVAL;
extern int linux_CONFIG_REPORTING_INTERVAL;


#if 0
/* This test cannot be done on linux because these
 * are not implimented as "#defines" instead they 
 * are implimented as variables
 */

/* Check if all the necessary parameters have been set for FH mode */
#if CONFIG_FH_ENABLE
#if !defined(FEATURE_ALL_MODES) && !defined(FEATURE_FREQ_HOP_MODE)
#error "Do you want to build image with frequency hopping mode? \
        Define either FEATURE_FREQ_HOP_MODE or FEATURE_ALL_MODES in features.h"
#endif
#endif

/* Check if stack level security is enabled if application security is enabled */
#if CONFIG_SECURE
#if !defined(FEATURE_MAC_SECURITY)
#error "Define FEATURE_MAC_SECURITY or FEATURE_ALL_MODES in features.h to \
        be able to use security at application level"
#endif
#endif

#endif /* if 0 */

#ifdef __cplusplus
}
#endif

#endif /* CONFIG_H */

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

