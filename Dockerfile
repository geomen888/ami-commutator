FROM node:12.20.1
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm -g config set user root
RUN npm i --production
RUN npm i -g @nestjs/cli
COPY dist /usr/src/app/dist
USER node
CMD npm run build && npm run start
EXPOSE 5000