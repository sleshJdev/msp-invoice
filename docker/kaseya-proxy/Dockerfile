FROM node:15.11.0
WORKDIR /home/node
COPY ./sc1-seamless-it-com-chain.pem ./sc1-seamless-it-com-chain.pem
COPY ./package.json ./package.json
ENV PROXY_PORT=8090
ENV NODE_EXTRA_CA_CERTS='/home/node/sc1-seamless-it-com-chain.pem'
ENV KASEYA_HOST='sc1.seamless-it.com'
RUN npm install
CMD [ "npm", "start" ]
