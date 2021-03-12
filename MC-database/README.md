# MC-database
© Copyright Benedict Adamson 2018-21.

MC-database is the game database server of the Mission Command game.
It is a [mongoDB](https://www.mongodb.com/) document database server.
It is distinct from the MC-auth-db component, which is the authentication and authorization database server.

MC-database is a Docker image, based on the official [`mongo` image](https://hub.docker.com/_/mongo) published by monogoDB. A Docker image for MC-database is available from the  public repository
[https://hub.docker.com/r/benedictadamson/mc-database](https://hub.docker.com/r/benedictadamson/mc-database).

## Usage
Use of the `mc-database` image is similar to use of the `mongo` image. In particular:
* Set the environment variable `MONGO_INITDB_ROOT_PASSWORD` to initialise a superuser in the `admin` authentication database, and to subsequently have the server start with authentication enabled.
* The data is stored in the directory `/data/db`, which should be a mounted volume.

However, the image sets the following environment variables used by the `mongo` base image, so you will not be able to override these.
* `MONGO_INITDB_DATABASE=mc`, to create a specific database for use with the rest of MC
* `MONGO_INITDB_ROOT_USERNAME=admin`, to specify the user name of the database administrator.

The image does some additional initialisation for a new container:
* It creates a database named `mc`.
* It creates a user named `mc`, recorded in the `admin` authentication database, using the environment variable `MC_INIT_PASSWORD` as the password for the user. The user has the `readWrite` role for the `mc` database, and no other roles.