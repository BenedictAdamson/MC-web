# Dockerfile for the MC-integration project,
# to produce an HTTP reverse proxy in a container.

# © Copyright Benedict Adamson 2020.
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

EXPOSE 80

RUN rm -r /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf
COPY rp.conf /etc/nginx/conf.d/rp.conf
CMD ["nginx", "-g", "daemon off;"]