# Dockerfile for the MC-front-end project,
# to produce the MC server in a container.

# © Copyright Benedict Adamson 2018-19.
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

FROM httpd:2.4-alpine
ARG VERSION
LABEL version="${VERSION}"
LABEL description="The Mission Command game back-end server."
LABEL maintainer="badamson@spamcop.net"
RUN rm -r /usr/local/apache2/htdocs/*
COPY src/main/resources/ /
COPY src/main/web/mc-front-end/dist/mc-front-end/ /usr/local/apache2/htdocs/