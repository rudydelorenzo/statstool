import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';
import * as fs from 'fs';
import * as path from "path";
import inquirer from 'inquirer';

const leagueIDs = {"Sr. Girls": "66851", "Sr. Boys": "66850", "Jr. Girls": "66853", "Jr. Boys": "66852"};
const noop = () => {};


class Team {

    name;
    played;
    wins;
    losses;
    pf;
    pa;
    points;

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
    let my_list = []

    for (let i = 0; i < tableBody.children.length; i++) {
        let el = tableBody.children[i]
        let my_el = []
        for (let j = 0; j < el.children.length; j++) {
            my_el.push(el.children[j].textContent.trim());
        }
        my_list.push(my_el)

    }
    return my_list;
}

function createAndSave(team, league) {
    if (!fs.existsSync(league)) {
        fs.mkdirSync(league, 0o744);
    }
    fs.writeFile(path.join(league, `${team.name}.json`), JSON.stringify(team), noop);
}

async function getStats(league_id) {
    let url = `http://metroathletics.ca/standings.php?league_id=${league_id}`;
    let jsdomDocument = new JSDOM(await (await fetch(url)).text());
    let document = jsdomDocument.window.document;

    let tableBody = document.querySelector("body > section > article > span:nth-child(10) > table.standings_table > tbody");

    let data = tableToArray(tableBody);

    let teams = [];
    for (let i = 0; i < data.length; i++) {
        teams.push(new Team(data[i]));
    }

    for (let i = 0; i < data.length; i++) createAndSave(teams[i], getKeyByValue(leagueIDs, league_id));

    console.log(`Done fetching stats for league ID: ${league_id}`);

}

function main() {
    inquirer
        .prompt([
            {
                type: 'checkbox',
                name: 'level',
                message: 'Which leagues do you want to download stats for?',
                choices: Object.keys(leagueIDs),
                default: Object.keys(leagueIDs)
            },
        ])
        .then((answers) => {
            for (let i = 0; i < answers.level.length; i++) {
                getStats(leagueIDs[answers.level[i]]);
            }
        });
}

main();
