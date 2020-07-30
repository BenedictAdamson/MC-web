# Dockerfile for the MC-front-end project,
# to produce the MC front-end server in a container.

# © Copyright Benedict Adamson 2018-20.
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
# along with MC.  If not, see <https://www.gnu.org/licenses/>.
#

FROM httpd:2.4-alpine
LABEL description="The Mission Command game front-end server."
LABEL maintainer="badamson@spamcop.net"
EXPOSE 80

RUN apk --no-cache add curl
HEALTHCHECK --interval=7s --timeout=3s CMD curl --fail http://localhost:80/ || exit

ARG VERSION
LABEL version="${VERSION}"

COPY src/main/resources/usr/local/apache2/conf/ /usr/local/apache2/conf/
RUN chown -R root:daemon /usr/local/apache2/conf/
RUN find /usr/local/apache2/conf/ -type f -exec chmod ug=r {} \;
RUN find /usr/local/apache2/conf/ -type d -exec chmod ug=rx {} \;

RUN rm -r /usr/local/apache2/htdocs/*
COPY src/main/web/mc-front-end/dist/mc-front-end/ /usr/local/apache2/htdocs/
RUN chown -R root:daemon /usr/local/apache2/htdocs/*
RUN find /usr/local/apache2/htdocs/ -mindepth 1 -type f -exec chmod ug=r {} \;
RUN find /usr/local/apache2/htdocs/ -mindepth 1 -type d -exec chmod ug=rx {} \;
