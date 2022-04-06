# EOS HISTORY DOWNLOADER
## download an EOS accounts transactions history

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

### Requirments
- docker (https://docs.docker.com/engine/install/)
- nodejs (https://nodejs.org/en/download/)
- yarn (`npm install yarn`)

### Usage

- To start the download run `yarn start <accountname>`. This will beging the download into the local postgres database. once the download is complete you can use a tool like tablePlus, psql, dbeaver to connect to the db at localhost:5432.
- Then you can run whatever queries you like: for example:
``
