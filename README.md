# Quick intro

**landCertificate** is a Hyperledger blockchain admin/client land certficate requester application built on top of Hyperledger where clients request a land certificate to a land conserver(admin) who will deliver the certificate. Online [mongoDB-atlas](https://www.mongodb.com/products/platform/atlas-database) is used to store clients' resquests, which are displayed in the admin panel.

A blockchain network that let's land conservers add its certificates in the blockchain, which can help against land ownership issues and problems.

The network was built using [Hyperledger Fabric V2.X.X](https://www.hyperledger.org/use/fabric) and the test were made on **_Linux/Debian 10 Buster_**, **_WSL/Debian 10 Buster_** and **_WSL/Ubuntu_** machines but should work on any given OS.
 
The web app is built with **_NodeJS_**, **_ExpressJS_**, **_REST API_** and **pug template** engine as a render for the front-end.

## Configuration and running

**TL;DR** : _if you are familiar with hyperlegder fabric and have everything needed for it to run set up, move to _**landcertificate-network/landcertificate-starter/**_ and [run & execute the network](#commands-execute)_.


**landCertificate** is built on top of Hyperledger Linux foundation, thus it's a must to install and configure Hyperledger first.

### Hyperledger installation and configuration

*Prerequisites*:
  - Install and configure Docker (tons of tutorial on the web, )
  - Install curl (`sudo apt update && sudo apt upgrade` then `sudo apt install curl` on linux machine)

*Hyperledger*:
  - Run this single command to download and install the samples, binaries, and docker image of the latest production release of HL:

  - `curl -sSL https://bit.ly/2ysbOFE | bash -s`
  - Find more details [Official HL documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html)
  - Run the test-network as described in [using the test-network tutoriel](https://hyperledger-fabric.readthedocs.io/en/release-2.2/test_network.html) to make sure that everything is set up.

### landCertificate, installation and running
Now how so we start our HL network and get our web app running?

First and foremost, download or clone this repo.\
Repo structure:
   - **landcertificate-network/_** : contains our full blockchain application. It contains our config files, crypto materials, starter-app, chaincode ... etc.
  <blockquote>
  
  As Hyperledger has changed [fabric_samples](https://github.com/hyperledger/fabric-samples) folder content and structure, _**landcertificat-network/**_ has the necerssary binaries and tools- to build and run up our netwrork. Its content could also be found in the original [fabric-samples version-2.0.0 repository](https://github.com/hyperledger/fabric-samples/releases/tag/v2.0.0-beta)
  </blockquote>
  
  - **_landcertificate-network/test-network/add_path_org1.sh_** : 
  a custom script that adds *peer cli*, *peer* and *fabric config* related path with org1's environment variables.\
  Copy this file (_test-network/add_path_org1.sh_) to *certficate-network/test-network*.

  - **_landcertificate-network/chaincode/landcertificate/_**: contains our smart contract code (**_javascript/_**, **_java/_**) which will be packaged (chaincode), installed and committed to corresponding peers.\
  Copy the folder **_chaincode/landcertificate/_** to **_landcertificate-network/chaincode_**.\
  Open terminal and run `npm install` to install packages. 
  
  - **_landcertificate-network/certificate-starter/_** : contains our client application and is the starting point of our application.
    * **_startBcLand.sh_** is the script that is going to start our network, bringing up HL docker images, creating channel, packaging, installing and deploying our chaincode.\
    *Note* : We're deploying our chaincode by nitializing the ledger which consists of requesting and invoking a chaincode initialization function (initLedger).\
    Check the flag **_cci_** in `./network.sh deployCC -ccn certificate -ccv 1 -cci initLedger`\
    If you don't want to initialize the ledger, remove `-cci initLedger` from _startBCertificate.sh_

    * **_networkDown.sh_** will bring down our network, thus stopping running docker containers.\
    Note: If you're restarting the netowrk, you'll probably want to manually remove the chaincode docker volumes as they'll create conflict. (`docker volumes prune` would remove all your docker volumes)

    * **_javascript/_** is where we're going to *enroll ou admin*, *registrer our user* (so he/she can run transactions against the network by invoking the chaincode) and *querying the ledger* to get added certificates as we've deployed our chaincode while initializing it.\
    Run `npm install` before using any scripts. 

    * **_java/_** same as *javascript/*, contains our administration scripts.
    Not fully implemented and neither fully tested.

    * **_apiserver/_** is our nodeJS application. It contains same administration scripts in *javascript/* and more.\
    Run `npm install` before using any enrolling admin, registering the user and invoking transactions.
    
<a name name="#commands-execute">_**Run & Execute Certificate**_</a>

Now that we went through all the folder and script let's see how we to start the app step by step :
  - Make sure you are in _**landcertificate-network/landcertificat-starter**_ run the following commands on your terminal:
    
    * `./startBcLand.sh` 
    * `cd apiserver/` 
    * `node enrollAdmin.js && node registerUser.js && node query.js`
    * `node apiserver.js` 
    * Now you can visit [http://localhost:8080/api/](http://localhost:8080/api/) or [http://localhost:8080/api/allcertificates](http://localhost:8080/api/allcertificates) to see already added certificates.

  ### Front-end views:

  #### ADMIN's views

  ##### <u>Certified lands</u>
  [http://localhost:8080/api/admin/index](http://localhost:8080/api/allcertificates)

  ![alt text](screenshots/admin_all_certificates.png "Add new land form")

##### <u>Adding new Land Certficate</u>

  [http://localhost:8080/api/admin/addland](http://localhost:8080/api/allcertificates)

![alt text](screenshots/admin_addland.png "Add new land form")


#### Client's views

  ##### <u>Request a certificate form</u>
  [http://localhost:8080/client/index](http://localhost:8080/api/allcertificates)

  ![alt text](screenshots/client_index.png "Client home page")

##### <u>Form filled</u>
![alt text](screenshots/client_req_filled.png "Client home page")

##### <u>Form submitted</u>
![alt text](screenshots/client_req_sent.png "Client home page")

##### <u>Admin got the request</u>
![alt text](screenshots/admin_addland_filled.png "Client home page")

After validation, our land is certified in the blockchain
![alt text](screenshots/admin_all_certificates_w_newly_entered.png "Client home page")

##### <u>Added certificate with it QR Code</u>

![alt text](screenshots/land_detail1.png "Client home page")
![alt text](screenshots/land_detail2.png "Client home page")



<cite>Once again the main idea was to get familiar with how **Hyperledger Fabric** build and handles blockchain rahter than the user application and user experience.</cite>

#### Contributions, remarks & questions
Please contact me by email in case you've got questions, remarks, ... regarding the project.\
Feel free to contribute by creating an [issue](https://github.com/alfahami/bcertificate/issues/new) and/or a [pull request](https://github.com/alfahami/bcertificate/pulls). \
The main focus was on getting familiar with Hyperledger and its different ways of building blockchain solutions. 


### Author
 [AL-FAHAMI TOIHIR](https://alfahami.github.io/ "Resume and protfolio page")
 
 ### Licence: 
Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
