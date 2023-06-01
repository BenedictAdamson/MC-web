# Dockerfile for the missioncommand-db image of the MC project,

# © Copyright Benedict Adamson 2018-23.
#
# This file is part of MC.
#
# MC is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# MC is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with MC-des.  If not, see <https://www.gnu.org/licenses/>.
#

FROM mongo:4.4
LABEL description="The Mission Command game database server."
LABEL maintainer="badamson@spamcop.net"
EXPOSE 8080
ADD missioncommand-db.deb missioncommand-db.deb
RUN dpkg -i --force-depends missioncommand-db.deb
RUN rm -rf /etc/mission-command
RUN rm -f /usr/share/missioncommand-db/bin/init-mc-admin
RUN rm missioncommand-db.deb
RUN mkdir /data/db/home-monogdb
RUN ln -s /data/db/home-monogdb /home/monogdb
RUN ln -s /usr/share/missioncommand-db/bin/init-mc-db /docker-entrypoint-initdb.d/init-mc-db.sh
RUN ln -s /usr/share/missioncommand-db/bin/init-mc-user /docker-entrypoint-initdb.d/init-mc-user.sh
ENV MONGO_INITDB_DATABASE=mc
ENV MONGO_INITDB_ROOT_USERNAME=admin
