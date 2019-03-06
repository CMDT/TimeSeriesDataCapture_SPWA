# TimeSeriesDataCapture_SPWA
Implementation of the Single Page Web App described in TimeSeriesDataCapture 

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Building
### Prerequisites

#### MongoDB Database
see [MongoDB Hosting](https://github.com/CMDT/TimeSeriesDataCapture#mongodb-hosting) and [MongoDB Creation](https://github.com/CMDT/TimeSeriesDataCapture#mongodb-creation)

#### Auth0 Account
see [Auth0](https://github.com/CMDT/TimeSeriesDataCapture#auth0)

### Deployment
#### Heroku
To build the Browse API on heroku simply click the Deploy To Heroku button above

#### Localhost
To build single page web application locally on a specified port:

```
node server.js
```


## Environment Variables

| Variable             | Example                                  | Description                              |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| DEBUG | * | Node debugging. Defines what components produce logging. Usually set to *|                                    
| PORT  |443 | Notionally, this variable is set to 443, but it simply    exists as a placeholder for heroku. When running locally use 8000|
| AUTH0_CLIENTID|*AUTH CLIENT ID*|Held by the API service, and written to the SPWA configuration file on initialisation. Used by the SPWA in the browser, as interface identifier in the Auth0 implicit flow. Must be passed to Auth0 as a parameter.Client ID associated with the App name in the Auth0 account.|
|AUTH0_DOMAIN|*AUTH DOMAIN*|Held by the API service, and written to the SPWA configuration file on initialisation. Used by the SPWA in the browser, as interface identifier in the Auth0 implicit flow. Must be passed to Auth0 as a parameter.|
|BROWSEAPI_URI|*BROWSE API URI*|Held by the API service, and written to the SPWA configuration file on initialisation. The URI of the Browse API|
|ONEDRIVE_AUTHSERVICEURI|*ONEDRIVE AUTH SERVICE URI*|Held by the API service, and written to the SPWA configuration file on initialisation. The URI of the OneDrive authentication service|

---

This project was funded via the [Marloes Peeters Research Group](https://www.marloespeeters.nl/) and mentored by [DigitalLabs@MMU](https://digitallabs.mmu.ac.uk/) as a [DigitalLabs Summer Project](https://digitallabs.mmu.ac.uk/what-we-do/teaching/). It is the work of [Yusof Bandar](https://github.com/YusofBandar).


<p align="center">
<img align="middle" src="https://trello-attachments.s3.amazonaws.com/5b2caa657bcf194b4d089d48/5b98c7ec64145155e09b5083/d2e189709d3b79aa1222ef6e9b1f3735/DigitalLabsLogo_512x512.png"  />
 </p>
 
 
<p align="center">
<img align="middle" src="https://trello-attachments.s3.amazonaws.com/5b2caa657bcf194b4d089d48/5b98c7ec64145155e09b5083/e5f47675f420face27488d4e5330a48c/logo_mmu.png" />
 </p>
