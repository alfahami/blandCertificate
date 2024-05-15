#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#
# Script that adds org environment variables (couldn't make this work fine because 
# every pushd create a new instance of the terminal and already set environment variables get lost )
# 
# #Adding peer cli, peer and fabric config related path
# dir=${PWD%/*}/test-network 
# export PATH=$dir/../bin:$PATH
# export FABRIC_CFG_PATH=$dir/../config/

# # Environment variables for Org1

# export CORE_PEER_TLS_ENABLED=true
# export CORE_PEER_LOCALMSPID="Org1MSP"
# export CORE_PEER_TLS_ROOTCERT_FILE=$dir/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
# export CORE_PEER_MSPCONFIGPATH=$dir/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
# export CORE_PEER_ADDRESS=localhost:7051

# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"javascript"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`
CC_SRC_PATH="../chaincode/landcertificate/javascript/"

# clean out any old identites in the wallets
rm -rf javascript/wallet/*
rm -rf apiserver/wallet/*

# launch network; create channel and join peer to channel
pushd ../test-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn titrecontract -ccv 1  -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd

. ../test-network/add_path_org1.sh

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Next, use the BCTitre applications to interact with the deployed Titre contract.
The Titre applications are available in multiple programming languages.
Follow the instructions for the programming language of your choice:

JavaScript:

  Start by changing into the "javascript" directory:
    cd javascript

  Next, install all required packages:
    npm install

  Then run the following applications to enroll the admin user, and register a new user
  called appUser which will be used by the other applications to interact with the deployed
  Titre contract:
    node enrollAdmin
    node registerUser

  You can run the invoke application as follows. By default, the invoke application will
  create a new Titre, but you can update the application to submit other transactions:
    node invoke

  You can run the query application as follows. By default, the query application will
  return all Titres, but you can update the application to evaluate other transactions:
    node query

EOF
