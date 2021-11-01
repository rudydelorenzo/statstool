const fetch = require('node-fetch')
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const standingsURLs = {"Sr. Girls": "league_id=66851&schedule_id=434642", "Sr. Boys": "league_id=66850&schedule_id=434641",
    "Jr. Girls": "league_id=66853&schedule_id=434644", "Jr. Boys": "league_id=66852&schedule_id=434643"};
const noop = () => {};


class Team {

    name;   // Team name on Metro Athletics
    seed;   // Position in the standings
    played; // Games Played
    wins;   // W
    losses; // L
    pf;     // Points in favour
    pa;     // Points against
    points; // Total points in the standings

    constructor(array) {
        if (array.length !== 7) {
            throw new Error("GARBAGE DATA RECEIVED FOR TEAM CREATION");
        } else {
            this.name = array[0];
            this.played = array[1];
            this.wins = array[2];
            this.losses = array[3];
            this.pf = array[4];
            this.pa = array[5];
            this.points = array[6];
        }
    }

}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function tableToArray(tableBody) {
    let array = []

    for (let i = 0; i < tableBody.children.length; i++) {
        let el = tableBody.children[i]
        let row = []
        for (let j = 0; j < el.children.length; j++) {
            row.push(el.children[j].textContent.trim());
        }
        array.push(row)

    }
    return array;
}

function createAndSave(team, league) {
    if (!fs.existsSync(league)) {
        fs.mkdirSync(league, 0o744);
    }
    // Write team info to files
    // File structure: league/teamname.json
    // TODO: In the future, structure should include year, sport, league, division
    fs.writeFile(path.join(league, `${team.name}.json`), JSON.stringify(team), noop);
}

async function getStats(standingsURL) {
    let url = `http://metroathletics.ca/standings.php?${standingsURL}`;
    let jsdomDocument = new JSDOM(await (await fetch(url)).text());
    let document = jsdomDocument.window.document;

    let tableBody = document.querySelector("body > section > article > span:nth-child(10) > table.standings_table > tbody");

    // data:    2D array of division table.
    let data = tableToArray(tableBody);

    let teams = [];
    for (let i = 0; i < data.length; i++) {
        teams.push(new Team(data[i]));
    }

    let league = getKeyByValue(standingsURLs, standingsURL);

    for (let i = 0; i < data.length; i++) createAndSave(teams[i], league);

    console.log(`Done fetching stats for league: ${league}\tURL: (${standingsURL})`);

}

function main() {
    inquirer
        .prompt([
            {
                type: 'checkbox',
                name: 'level',
                message: 'Which leagues do you want to download stats for?',
                choices: Object.keys(standingsURLs),
                default: Object.keys(standingsURLs)
            },
        ])
        .then((answers) => {
            for (let i = 0; i < answers.level.length; i++) {
                getStats(standingsURLs[answers.level[i]]);
            }
        });
}

main();
