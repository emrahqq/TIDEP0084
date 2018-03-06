/******************************************************************************

 @file  oad_image_preamble.h

 @brief This file contains the image preable information.

 Group: WCS, BTS
 $Target Devices: Linux: AM335x, Embedded Devices: CC1310, CC1350, CC1352$

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
 $Release Date: Sept 27, 2017 (2.04.00.13)$
 ******************************************************************************/

#ifndef _OAD_IMAGE_PREAMBLE_H
#define _OAD_IMAGE_PREAMBLE_H

#ifdef __cplusplus
extern "C"
{
#endif

/*******************************************************************************
 * INCLUDES
 ******************************************************************************/

/*******************************************************************************
 * CONSTANTS
 ******************************************************************************/

/*
 * BIM Varible Address
 * The bim_var is a variable stored in RAM that is used to control switching
 * between persistent and user application in the BIM
 * On 26xx platforms RAM is retained between resets and this is possible
 *
 * Warning! placement of the BIM variable must respect the following
 * reserved RAM regions ( Valid for CC2640R2):
 *    - TI-RTOS in ROM reserved region: 0x20000100-0x20000280
 *    - BLE Stack memory: < ICALL_RAM0_START
 *    - Vector Table in RAM: 0x20000000-0x200000C8
 * Failing to respect either of the above boundaries will result in a
 * linker error
 */
#ifdef OAD_ONCHIP
  #define BIM_VAR_ADDR  0x20000400
  extern uint32_t _bim_var;
#endif // OAD_ONCHIP

/*
 * NV Page Setting:
 * This define is used ensure the stack is built with a compatible NV setting
 * Note: this restriction does not apply to the stack library configuration
 * for off-chip OAD
 */
#define OAD_NUM_NV_PGS  1

#ifdef OSAL_SNV
  #if OSAL_SNV != OAD_NUM_NV_PGS
    #error "Incompatible NV settings detected. OAD supports 1 NV page"
  #endif //OSAL_SNV != OAD_NUM_NV_PGS
#endif //OSAL_SNV

// Image types
#define OAD_IMG_TYPE_PERSISTENT_APP       0
#define OAD_IMG_TYPE_APP                  1
#define OAD_IMG_TYPE_STACK                2
#define OAD_IMG_TYPE_APP_STACK            3
#define OAD_IMG_TYPE_NP                   4
#define OAD_IMG_TYPE_FACTORY              5
#define OAD_IMG_TYPE_BIM                  6
#define OAD_IMG_TYPE_APPSTACKLIB          7
#define OAD_IMG_TYPE_USR_BEGIN            16
#define OAD_IMG_TYPE_USR_END              31
#define OAD_IMG_TYPE_HOST_BEGIN           32
#define OAD_IMG_TYPE_HOST_END             63
#define OAD_IMG_TYPE_RSVD_BEGIN           64
#define OAD_IMG_TYPE_RSVD_END             255

//!< Wireless Technology Types
#define OAD_WIRELESS_TECH_BLE             0xFFFE
#define OAD_WIRELESS_TECH_TIMAC_SUBG      0xFFFD
#define OAD_WIRELESS_TECH_TIMAC_2_4G      0xFFFB
#define OAD_WIRELESS_TECH_ZIGBEE          0xFFF7
#define OAD_WIRELESS_TECH_RF4CE           0xFFEF
#define OAD_WIRELESS_TECH_THREAD          0xFFDF
#define OAD_WIRELESS_TECH_EASYLINK        0xFFBF

/*
 * These values are modified from source/ti/common/26xx/oad/oad_image_header.h
 * Any device specific #ifdef's had to be removed and modified to seperate #define
 * statements since the linux collector has no knowledge of device type
 */
#define CC26X2_OAD_IMG_ID_VAL             "CC26x2R1"
#define CC13X2_OAD_IMG_ID_VAL             "CC13x2R1"
#define OAD_IMG_ID_VAL                    "OAD IMG "

// External flash metadata identification value
#define OAD_EXTFL_ID_VAL                  "OAD NVM1"

#define OAD_IMG_ID_LEN               8                                       /* OAD image identification bytes length */
#define OAD_SW_VER_LEN               4                                       /* OAD software version length in bytes */
#define OAD_IMG_HDR_LEN              sizeof(imgFixedHdr_t)                   /* The length of just the OAD Header */
#define CRC_OFFSET                   offsetof(imgHdr_t, fixedHdr.crc32)      /* Supported metadata version */
#define BIM_VER_OFFSET               offsetof(imgHdr_t, fixedHdr.bimVer)     /* BIM metadata version offset */
#define IMG_DATA_OFFSET              BIM_VER_OFFSET                          /* Start of data after CRC bytes */
#define IMG_INFO_OFFSET              offsetof(imgHdr_t, fixedHdr.imgCpStat)  /* ImageInfo Bytes offset */
#define IMG_COPY_STAT_OFFSET         IMG_INFO_OFFSET                         /* Image copy status */
#define CRC_STAT_OFFSET              offsetof(imgHdr_t, fixedHdr.crcStat)    /* Offset to CRC status byte */
#define IMG_TYPE_OFFSET              offsetof(imgHdr_t, fixedHdr.imgType)    /* Offset to CRC status byte */
#define BOUNDARY_SEG_OFFSET          offsetof(imgHdr_t, fixedHdr.segTypeBd)  /* Offset into image header for boundary */

#define SEG_LEN_OFFSET               4                                    /* Offset from seg header to seg len */
#define SEG_HDR_LEN                  12                                   /* Length of the segment header bytes */

#define IMG_PAYLOAD_SEG_ID           1                                    /* Id of the image payload segment */
#define IMG_BOUNDARY_SEG_ID          0                                    /* Id of RAM/stack boundary segment */
#define IMG_NONCOUNT_SEG_ID          2                                    /* Id of non contigouous image segment */
#define IMG_SECURITY_SEG_ID          3                                    /* Id of security segment */

#define BIM_VER                      0x3                                  /* Supported BIM version */
#define META_VER                     0x1                                  /* Supported metadata version */
#define DEFAULT_STATE                0xFF                                 /* default status */
#define CRC_VALID                    0xFE
#define CRC_INVALID                  0xFC
#define NEED_COPY                    0xFE                                  /* Image to be copied on on-chip flash at location indicated in the image */
#define COPY_DONE                    0xFC                                  /* Image already copied */

#define EFL_MATADATA_HDR_LEN         OAD_IMG_HDR_LEN + 8                   /* External flash meta-data header length */

#define INVALID_ADDR                 0xFFFFFFFF
#define INVALID_LEN                  INVALID_ADDR
#define DEFAULT_CRC                  0xFFFFFFFF

/*******************************************************************************
 * Typedefs
 */
#if defined (__IAR_SYSTEMS_ICC__)
  #define TYPEDEF_STRUCT_PACKED        __packed typedef struct
#elif defined __TI_COMPILER_VERSION || defined __TI_COMPILER_VERSION__
  #define TYPEDEF_STRUCT_PACKED        typedef struct __attribute__((packed))
#elif defined (__GNUC__)
  #define TYPEDEF_STRUCT_PACKED        typedef struct __attribute__((__packed__))
#endif
  
/* Image Preamble */
TYPEDEF_STRUCT_PACKED
{
  uint8_t   imgID[8];       //!< User-defined Image Identification bytes. */
  uint32_t  crc32;          //!< Image's crc32 value */
  uint8_t   bimVer;         //!< BIM version */
  uint8_t   metaVer;        //!< Metadata version */
  uint16_t  techType;       //!< Wireless protocol type BLE/TI-MAC/ZIGBEE etc. */
  uint8_t   imgCpStat;      //!< Image copy status */
  uint8_t   crcStat;        //!< CRC status */
  uint8_t   imgType;        //!< Image Type */
  uint8_t   imgNo;          //!< Image number of 'image type' */
  uint32_t  imgVld;         //!< In indicates if the current image in valid 0xff - valid, 0x00 invalid image */
  uint32_t  len;            //!< Image length in bytes. */
  uint32_t  prgEntry;       //!< Program entry address */
  uint8_t   softVer[4];     //!< Software version of the image */
  uint32_t  imgEndAddr;     //!< Address of the last byte of a contiguous image */
  uint16_t  hdrLen;         //!< Total length of the image header */
  uint16_t  rfu;            //!< Reserved bytes */
} imgFixedHdr_t;

/* Image payload segment */
TYPEDEF_STRUCT_PACKED
{
  uint8_t   segTypeImg;     //!< Segment type - for Contiguous image payload */
  uint16_t  wirelessTech;   //!< Wireless technology type */
  uint8_t   rfu;            //!< Reserved byte */
  uint32_t  imgSegLen;      //!< Payload segment length */
  uint32_t  startAddr;      //!< Start address of image on internal flash */
} imgPayloadSeg_t;

/* Image boundary segment */
TYPEDEF_STRUCT_PACKED
{
  uint8_t   segTypeBd;      //!< Segment type - for boundary segment */
  uint16_t  wirelessTech;   //!< Wireless technology type */
  uint8_t   rfu;            //!< Reserved byte */
  uint32_t  boundarySegLen; //!< Boundary segment length */
  uint32_t  stackStartAddr; //!< Start address of stack image on internal flash */
  uint32_t  stackEntryAddr; //!< Stack start address */
  uint32_t  ram0StartAddr;  //!< RAM entry start address */
  uint32_t  ram0EndAddr;    //!< RAM entry end address */
} boundarySeg_t;

/* Complete Image Header */
TYPEDEF_STRUCT_PACKED
{
   imgFixedHdr_t         fixedHdr;
#if (!defined(STACK_LIBRARY) && (defined(SPLIT_APP_STACK_IMAGE)))
   boundarySeg_t         boundarySeg;
#endif
   imgPayloadSeg_t       imgPayload;
} imgHdr_t;
#ifdef __cplusplus
}
#endif

#endif /* _OAD_IMAGE_PREAMBLE_H */
