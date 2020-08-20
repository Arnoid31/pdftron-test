FROM node:12

WORKDIR /app/

COPY . .

## package.json must be init here in order to avoid ELF header error
RUN npm init -y && npm i -S express @pdftron/pdfnet-node

CMD ["npm", "start"]
