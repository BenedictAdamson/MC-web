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

FROM nginx:1
LABEL description="The Mission Command game front-end server."
LABEL maintainer="badamson@spamcop.net"

ARG VERSION
LABEL version="${VERSION}"

EXPOSE 80

RUN rm -r /usr/share/nginx/html/*

COPY classes/etc/nginx/conf.d/*.conf /etc/nginx/conf.d/
COPY ng-dist/mc-front-end/ /usr/share/nginx/html