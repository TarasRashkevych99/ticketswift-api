FROM node:19.7.0

WORKDIR /app

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/TarasRashkevych99/ticketswift-api.git .

RUN git checkout features/payments

RUN npm install

RUN cd ./keys && /bin/bash ./generate_keys.sh

EXPOSE 5000

CMD ["npm", "run", "start"]
