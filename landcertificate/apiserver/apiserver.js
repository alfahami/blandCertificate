var express = require('express');
var bodyParser = require('body-parser');
var cors = require("cors");
var urlencodedParser = bodyParser.urlencoded({extended: true})
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var xlsxtojson = require("xlsx-to-json");
var xlstojson = require("xls-to-json");
var app = express();


// Setting for Hyperledger Fabric
const { Gateway,Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
// MongoDB Client
const MongoClient = require('mongodb').MongoClient
const connectionString = "mongodb+srv://titre:titre@cluster0.khoqt.mongodb.net/?retryWrites=true&w=majority"


// MIDDLEWARE

app.use(cors());
app.use(bodyParser.json());
app.set("view engine","pug");
// For getting the date in pug
app.locals.moment = require('moment');
// Setting up static folder
app.use('/static', express.static('views/public'))



// ROUTES

MongoClient.connect(connectionString, (err, client) => {
    if (err) return console.error(err)
    console.log('Connected to Database')

    const db = client.db('titresclient')
    const titreCollection = db.collection('titres')

    app.set("view engine","pug");
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    
    app.get('/index', (req, res) => {            
        res.render('client/index.pug')
    })

    app.post('/confirmation', (req, res) => {
        titreCollection.insertOne(req.body)
            .then(result => {
                console.log(result)
                res.render("client/index", {alert_msg: "Nous avons reçu et traitons votre demande, revenez dans max 7 jours pour recupérer votre certificat!"})
            })
            .catch(error => console.error(error))
    })

    app.get('/api/addtitre', function (req, res) {

        // send data from database
        db.collection('titres').find().toArray()
        .then(results => {
            res.render('admin/createtitre', { results: results })
            console.log(results)
        })
        .catch(error => console.error(error))
      })
    
});



  app.get('/api/', function (req, res) {    
        res.redirect('/api/alltitres');
  })


app.get('/api/alltitres', async function (req, res)  {
    try {
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
// Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
  // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('titrecontract');

        // Evaluate the specified transaction.
        const result = await contract.evaluateTransaction('queryAllTitres');
	console.log(JSON.parse(result)[0]["Record"]);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.render("admin/alltitres",{ list:JSON.parse(result)});
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


/* code for uploading excel data*/

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });
    var upload = multer({ //multer settings
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');
                
    /** API path that will upload the files */
    app.post('/api/preview_excel_data', function(req, res) {
        var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
  
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:false
                }, async function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    
                    // Launching transactions 
                    for (const item of result) {
                        try {
                                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                                        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                                // Create a new file system based wallet for managing identities.
                                        const walletPath = path.join(process.cwd(), 'wallet');
                                        const wallet = await Wallets.newFileSystemWallet(walletPath);
                                        console.log(`Wallet path: ${walletPath}`);
                                
                                        // Check to see if we've already enrolled the user.
                                        const identity = await wallet.get('appUser');
                                        if (!identity) {
                                            console.log('An identity for the user "appUser" does not exist in the wallet');
                                            console.log('Run the registerUser.js application before retrying');
                                            return;
                                        }
                                  // Create a new gateway for connecting to our peer node.
                                        const gateway = new Gateway();
                                        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
                                
                                        // Get the network (channel) our contract is deployed to.
                                        const network = await gateway.getNetwork('mychannel');
                                
                                        // Get the contract from the network.
                                        const contract = network.getContract('titrecontract');
                                // Submit the specified transaction.
                                        // createCertificate transaction - requires 8 argument, ex: ('createCertificate', 'CERT12', 'Honda', 'Accord', 'Black', 'Tom')
                                        // changeCarOwner transaction - requires 2 args , ex: ('changeStudentName', 'CERT10', 'HADI')
                                        await contract.submitTransaction('createTitre', item["titreNumber"], item["fullName"], item["cin"], item["address"], item["email"], item["indice"], 
                                        item["city_fonc"], item["special_indice"]);
                                        console.log('Transaction has been submitted');
                                       // res.redirect('/api/query/' + req.body.titreNumber)
                                       
                                
                                // Disconnect from the gateway.
                                        await gateway.disconnect();
                                } catch (error) {
                                        console.error(`Failed to submit transaction: ${error}`);
                                        process.exit(1);
                                }    
                    }
                    res.redirect('/api/alltitres');

                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
    });



app.post('/api/addtitre', urlencodedParser, async function (req, res) {
    try {
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
// Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
  // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('titrecontract');
// Submit the specified transaction.
        await contract.submitTransaction('createTitre', req.body.titreNumber, req.body.fullName, req.body.cin, req.body.address, req.body.email, req.body.indice, req.body.city_fonc, req.body.special_indice);
        console.log('Transaction has been submitted');
        res.redirect('/api/query/' + req.body.titreNumber)

// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})

app.get('/api/query/:titre_index', async function (req, res) {
    
        try {
    const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
      // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const contract = network.getContract('titrecontract');
     // Evaluate the specified transaction.
            
            const result = await contract.evaluateTransaction('queryTitre', req.params.titre_index);
            //titreNum["titreNumber"] = req.params.titre_index;
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.render("admin/titre-details",{ titre:JSON.parse(result)});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });
    


app.put('/api/changetitreowner/:titre_index', async function (req, res) {
    try {
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
// Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
  // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel'); 

        // Get the contract from the network.
        const contract = network.getContract('titrecontract');
// Submit the specified transaction.
        await contract.submitTransaction('changeTitreOwner', req.params.titre_index, req.body.fullName);
        console.log('Transaction has been submitted');
        res.send('Transaction has been submitted');
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
});

// Client 




app.listen(8080);

