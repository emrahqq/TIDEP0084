#############################################################
# @file Makefile
#
# @brief TIMAC 2.0 Collector Example Application Makefile
#
# Group: WCS LPC
# $Target Devices: Linux: AM335x, Embedded Devices: CC1310, CC1350, CC1352$
#
#############################################################
# $License: BSD3 2016 $
#  
#   Copyright (c) 2015, Texas Instruments Incorporated
#   All rights reserved.
#  
#   Redistribution and use in source and binary forms, with or without
#   modification, are permitted provided that the following conditions
#   are met:
#  
#   *  Redistributions of source code must retain the above copyright
#      notice, this list of conditions and the following disclaimer.
#  
#   *  Redistributions in binary form must reproduce the above copyright
#      notice, this list of conditions and the following disclaimer in the
#      documentation and/or other materials provided with the distribution.
#  
#   *  Neither the name of Texas Instruments Incorporated nor the names of
#      its contributors may be used to endorse or promote products derived
#      from this software without specific prior written permission.
#  
#   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
#   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
#   THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
#   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
#   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
#   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
#   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
#   OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
#   WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
#   OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
#   EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#############################################################
# $Release Name: TI-15.4Stack Linux x64 SDK$
# $Release Date: Sept 27, 2017 (2.04.00.13)$
#############################################################

_default: _app

COMPONENTS_HOME=../../components
SDK_HOME=../../../

HERE=$(shell pwd)
CFLAGS += -include ${HERE}/timac_features.h
CFLAGS += -DAUTO_START
CFLAGS += -DNV_RESTORE
CFLAGS += -DPROCESS_JS
#CFLAGS += -DFCS_TYPE16
CFLAGS += -DIS_HEADLESS
#CFLAGS += -DTIRTOS_IN_ROM
CFLAGS += -I.
CFLAGS += -I${COMPONENTS_HOME}/common/inc
CFLAGS += -I${COMPONENTS_HOME}/nv/inc
CFLAGS += -I${COMPONENTS_HOME}/api/inc
CFLAGS += -I${SDK_HOME}

include ../../scripts/front_matter.mak

APP_NAME = collector

C_SOURCES += linux_main.c
C_SOURCES += cllc.c
C_SOURCES += collector.c
C_SOURCES += csf_linux.c
C_SOURCES += appsrv.c
C_SOURCES += util.c
C_SOURCES += oad_protocol.c

APP_LIBS    += libnv.a
APP_LIBS    += libapimac.a
APP_LIBS    += libcommon.a

#APP_LIBDIRS += ${PROTOC_INSTALL_DIR}/lib
APP_LIBDIRS += ${COMPONENTS_HOME}/cllc/${OBJDIR}
APP_LIBDIRS += ${COMPONENTS_HOME}/nv/${OBJDIR}
APP_LIBDIRS += ${COMPONENTS_HOME}/api/${OBJDIR}
APP_LIBDIRS += ${COMPONENTS_HOME}/common/${OBJDIR}
APP_LIBDIRS += ${OBJDIR}

include ../../scripts/app.mak

#  ========================================
#  Texas Instruments Micro Controller Style
#  ========================================
#  Local Variables:
#  mode: makefile-gmake
#  End:
#  vim:set  filetype=make
