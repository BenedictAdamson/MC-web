# Dockerfile for the use in the Jenkinsfile for the MC project,
# to set up the build environment for Jenkins to use.

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

# Need Docker, Java 11 and Maven

FROM debian:stretch-backports
RUN apt-get -y update && apt-get -y install \
   apt-transport-https \
   ca-certificates \
   curl \
   gnupg-agent \
   maven \
   openjdk-11-jdk-headless \
   software-properties-common
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN add-apt-repository -y \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
RUN apt-get -y update && apt-get -y install \
   containerd.io \
   docker-ce \
   docker-ce-cli
   