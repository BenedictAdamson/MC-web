#!/bin/sh
# inituser-mc.sh

if [ -z "${MC_INIT_PASSWORD-}" ]; then
   echo "MC_INIT_PASSWORD not set; not creating mc user"
else
mongo <<EOF
   use admin
   db.createUser(
      {
         user: "mc",
         pwd: "$MC_INIT_PASSWORD",
         roles: [ { role: "readWrite", db: "mc" } ]
      }
   )
EOF
fi
