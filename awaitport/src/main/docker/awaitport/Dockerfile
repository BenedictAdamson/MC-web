# Dockerfile for the benedictadamson/awaitport image of the MC project,

# © Copyright Benedict Adamson 2020-23.
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

FROM alpine:3
LABEL description="Wait until a TCP port accepts connections."
LABEL maintainer="badamson@spamcop.net"
ENTRYPOINT [ "/bin/awaitport" ]