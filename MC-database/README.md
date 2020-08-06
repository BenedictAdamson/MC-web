# MC-database
© Copyright Benedict Adamson 2018-20.

MC-database is the database server of the Mission Command game. It is a [mongoDB](https://www.mongodb.com/) document database server.

MC-database is a Docker image, based on the official [`mongo` image](https://hub.docker.com/_/mongo) published by monogoDB. A Docker image for MC-database is available from the  public repository
[https://hub.docker.com/r/benedictadamson/mc-database](https://hub.docker.com/r/benedictadamson/mc-database).

## Usage
Use of the `mc-database` image is similar to use of the `mongo` image. In particular:
* Set the environment variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` to initialise a superuser in the `admin` authentication database, and to subsequently have the server start with authentication enabled.
* The data is stored in the directory `/data/db`, which should be a mounted volume.

However, the image sets the `MONGO_INITDB_DATABASE` environment variable to `mc`, to create a specific database for use with the rest of MC, so you will not be avble to use that environment variable to create a different database.