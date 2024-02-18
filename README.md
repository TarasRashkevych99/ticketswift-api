# ticketswift-api

This repository provides a RESTful APIs for purchasing event tickets

## Deployment

Run the following docker commands to deploy the application

```bash
sudo docker build --no-cache -t ticketswift-api .
sudo docker run --name ticketswift-api -d -p 5000:5000 --env-file .env ticketswift-api
```
