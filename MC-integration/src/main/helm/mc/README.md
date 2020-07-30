# MC
The Mission Command game.

## License

© Copyright Benedict Adamson 2018-20.
 
![AGPLV3](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)

MC is free software: you can redistribute it and/or modify
it under the terms of the
[GNU Affero General Public License](https://www.gnu.org/licenses/agpl.html)
as published by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MC is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with MC.  If not, see <https://www.gnu.org/licenses/>.

## Components

MC provides a web interface: you play it using a web browser, using a URL that indicates the installation (server) of MC that you wish to play. An installation of MC has several components that together provide the information used by your browser:
* A *front end*, which runs in the browser.
* A *front end HTTPD server*, which communicates with the browser. It provides your browser with the code for the front end. It forwards requests from the browser (or front end) that require complicated processing to the *back end*.
* A *back end HTTPD server*, which does the complicated processing.
* A *database server*, which records long term information.