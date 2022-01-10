FROM node:12.18.4-alpine AS build-env

# Install linux dependencies
RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base 

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN pip install virtualenv 
  
RUN rm -rf /var/cache/apk/*    
    
# Create app directory
WORKDIR /app

# Install app dependencies
COPY . /app

# RUN ls -la

# RUN npm config set unsafe-perm true
RUN npm i


EXPOSE 5050
CMD npm start
