# StatsTool
## What's StatsTool

StatsTool is a NodeJS utility to fetch team stats from 
Metro Athletics and save them to JSON files for use in in-game 
graphics.

## Terminology
| Term     | Meaning                                                                                    |
|----------|--------------------------------------------------------------------------------------------|
| Division | Divisions within leagues, based on team performance. Teams only play within their division |
| League   | Level + Gender of team, eg. Sr. Men/Jr. Girls                                              |

## Technologies / Dependencies
* NodeJS
* PKG compiling and packaging
* node-fetch
* JSDOM
* Inquirer
* node/fs
* node/path

## Developer notes
To compile, run `pkg package.json`, this will create native executables for macOS, linux and windows.