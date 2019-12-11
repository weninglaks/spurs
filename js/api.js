const base_url = "https://api.football-data.org/v2/";
const token    = "f5fab0e8ba8b41b8a65ccec3b7778e07"


function status(response) {
  if (response.status !== 200) {
    console.log(response.status)
    return Promise.reject(new Error(response.statusText));
  } else {
    return Promise.resolve(response);

  }
}

function json(response) {
  return response.json();
}

function error(error) {
  console.log(error);
}


function fetchApi (url) {
  return fetch(url, {
    headers: {
      'X-Auth-Token': token
    }
  });
};

function fetchData (url, callback) {
  fetchApi(url)
    .then(status)
    .then(json)
    .then(function(data) {
      callback(data)
    })
    .catch(error);
}

const getUpcomingMatches = () => {
  fetchData(
    base_url + "teams/73/matches?status=SCHEDULED&limit=11",
    (data) => {
      let matches = ""

      data.matches.forEach(function(obj) {
        let date = new Date(obj.utcDate)
        let tanggal = date.getUTCDate()
        let bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][date.getUTCMonth()]
        let tahun = date.getUTCFullYear()
        let jam = `${date.getUTCHours()}:${date.getUTCMinutes() === 0 ? '00': date.getUTCMinutes()}`

        matches += `
              <div class="row matchWrap red darken-2 white-text">
                <div class="col s3 m3 l3 ">
                  <div class="competitionName">${obj.competition.name}</div>
                  <div>
                    ${obj.homeTeam.id === 73 ? "Kandang" : "Tandang"}</div>
                </div>
                <div class="col s6 m6 l7  valign-wrapper">
                  <div class="col"><b>${obj.homeTeam.id === 73 ? obj.awayTeam.name : obj.homeTeam.name}</b></div>
                </div>
                <div class="col s3 m3 l2  center-align">
                  <div>${tanggal} ${bulan}</div>
                  <div>${jam}</div>
                </div>
              </div>
            `;
      });
       document.getElementById("upcomingMatches").innerHTML = matches;
    }
  )
}


const getLeagueStanding = () => {
  fetchData(
    base_url + "competitions/2021/standings/",
    data => {
      let klasemen = data.standings[0];
      let tableBody = ""

      klasemen.table.forEach( (obj) => {

        tableBody += `
          <tr class="${obj.team.id === 73? 'red darken-2 white-text standing' : 'standing'}">
            <td class="center-align">${obj.position}</td>
            <td>${obj.team.name}</td>
            <td class="center-align">${obj.playedGames}</td>
            <td class="center-align">${obj.won}</td>
            <td class="center-align">${obj.draw}</td>
            <td class="center-align">${obj.lost}</td>
            <td class="center-align">${obj.goalDifference}</td>
            <td class="center-align">${obj.points}</td>
          </tr>
        `
      });

      let table = `
        <table class="highlight responsive-table">
           <thead>
             <tr>
                 <th class="center-align">Pos</th>
                 <th >Club</th>
                 <th class="center-align">D</th>
                 <th class="center-align">M</th>
                 <th class="center-align">S</th>
                 <th class="center-align">K</th>
                 <th class="center-align">SG</th>
                 <th class="center-align">Pn</th>
             </tr>
           </thead>

           <tbody id="standings-table">

            ${tableBody}

           </tbody>
        </table>
      `

      document.getElementById("tableGoesHere").innerHTML = table

    })
}



//////////////// Handle page "LAWAN" ////////////////////

let teamList = [];
let spursInfo     = {};

const handleLawanPage = async () => {

  let firstResponse = await fetchApi (base_url + "competitions/2021/standings/");
  let firstResult   = await firstResponse.json();

  let selectTeam    = ``;
  let afterSpurs    = false

  for (const [i, obj] of firstResult.standings[0].table.entries()) {
    let num  = afterSpurs ? i - 1 : i
    let item = {
        id: obj.team.id,
        name: obj.team.name,
        crestURL: obj.team.crestUrl,
        position: obj.position,
        goalDifference: obj.goalDifference,
        points: obj.points,
        result: obj.result
    };

    if ( obj.team.id === 73 ) {
      spursInfo  = item
      afterSpurs = true
    } else {
      teamList.push(item);
      selectTeam += `
               <option value=${num}><b>${obj.team.name}</b></option>
             `
    }
 }

 document.querySelector('#selectTeam').innerHTML = selectTeam;
 loadSpursInfo(spursInfo);
 loadSingleTeamInfo();
}


const loadSpursInfo = (spurs) => {
  document.getElementById('teamCrest-spurs').innerHTML = `<img class="responsive-crest" src=${spurs.crestURL} alt="team crest" >`
  document.getElementById('position-spurs').innerText = spurs.position
  document.getElementById('goalDifference-spurs').innerText = spurs.goalDifference
  document.getElementById('points-spurs').innerText = spurs.points

  getTeamForm(spurs, `overallForm-spurs`)
}


const getTeamForm = (object, targetDivId) => {

  fetchData(
    `${base_url}teams/${object.id}/matches?status=FINISHED`,
    data => {
      let lastFiveMatches = data.matches.slice(-5)
      let form = [];

      for (const obj of lastFiveMatches) {
        let formItem = {
          matchId: obj.id,
          venue: obj.awayTeam.id === object.id ? "AWAY" : "HOME",
          versus: obj.awayTeam.id === object.id ? obj.homeTeam : obj.awayTeam,
          utcDate: obj.utcDate,
          competition: obj.competition,
          score: obj.score.fullTime
        }

        switch (obj.score.winner) {
          case "AWAY_TEAM":
            formItem.point = obj.awayTeam.id === object.id ? 3 : 0;
            formItem.result = obj.awayTeam.id === object.id ? "M" : "K";
            break;
          case "HOME_TEAM":
            formItem.point = obj.awayTeam.id === object.id ? 0 : 3;
            formItem.result = obj.awayTeam.id === object.id ? "K" : "M";
            break;
          case "DRAW":
            formItem.point = 1;
            formItem.result = "S";
            break;
          default: formItem.result = "N/A";
        }

        form.push(formItem)

      }

      function classNamer (point)  {
        if (point===3) {
          return "menang"
        } else if (point === 1) {
          return "seri"
        } else if (point === 0){
          return "kalah"
        } else {
          return "match-unavailable"
        }
      }

      let formHTML = `<div class="col s1 m1 l1"></div>`
      form.forEach( obj => {
        formHTML += `
          <div class="col s2 m2 l2 matchResult ${classNamer(obj.point)}">${obj.result}</div>
        `
      })

      document.getElementById(targetDivId).innerHTML = formHTML

    })
}

const loadSingleTeamInfo = () => {
  let i    = document.getElementById("selectTeam").value;
  let data = teamList[i]


  document.getElementById('teamCrest').innerHTML = `<img class="responsive-crest" src=${data.crestURL} alt="team crest" >`
  document.getElementById('position').innerText = data.position
  document.getElementById('goalDifference').innerText = data.goalDifference
  document.getElementById('points').innerText = data.points


  let textHTML = `
  <div>Performa 5 laga terakhir</div>
  <div id="overallForm" class="row">
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  </div>
  <a class="waves-effect waves-light btn-small red darken-2" onClick="addFavorite(${data.id})"}>
    Favoritkan
  </a>
  `
  document.getElementById('kolomForm').innerHTML = textHTML

  getTeamForm(data, "overallForm")

}
