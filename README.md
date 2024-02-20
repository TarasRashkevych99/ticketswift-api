# ticketswift-api

This repository provides a RESTful APIs for purchasing event tickets



## Environment Variables

This project relies on several environment variables for configuration.

| Variable            | Description                                           |
|---------------------|-------------------------------------------------------|
| CONNECTION_STRING   | Connection string for the database                    |
| FORECAST_URL        | URL for Open Meteo API for weather forecast            |
| FRONTEND_URL        | URL of the frontend application (optional)            |
| PAYPAL_CLIENT_ID    | Client ID for PayPal integration                      |
| PAYPAL_CLIENT_SECRET| Client secret for PayPal integration                  |
| PORT                | Port number for the server                            |
| SESSION_SECRET      | Secret key for session management                     |
| TICKETMASTER_KEY    | API key for Ticketmaster integration                  |
| TICKETMASTER_URL    | URL for Ticketmaster API                               |
| TOKEN_EXPIRES_IN    | Token expiration duration in seconds                  |

### Mongodb
- `CONNECTION_STRING`: here you have to insert the connection string to the Mongodb database

### Paypal
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`: these are aviable after having created an account in the [Paypal Developer](https://developer.paypal.com/docs/api/payments/v1/) website

### Ticketmaster
- `TICKETMASTER_KEY`: you must sign up on the [Ticketmaster](https://developer-acct.ticketmaster.com/user/login) website as a developer and generate your own API Key

Before running the application, make sure to set the required environment variables. You can do this by renaming the `.env.example` file in the root of your project, populating it with the necessary values and rename it as `.env`. 



## Deployment

Run the following docker commands to deploy the application

```bash
sudo docker build --no-cache -t ticketswift-api .
sudo docker run --name ticketswift-api -d -p 5000:5000 --env-file .env ticketswift-api
```
