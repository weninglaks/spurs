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


const fetchApi = function(url) {
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
      let table = ""

      klasemen.table.forEach( (obj) => {

        table += `
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
      document.getElementById("standings-table").innerHTML = table

    }
  )
}

let dbPromise = idb.open("spurs_info_db", 2, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains("teamInfo")) {
    var bikinTable = upgradeDb.createObjectStore("teamInfo", { keyPath: "id" });
    bikinTable.createIndex("name", "name", { unique: false });
  }
  if(!upgradeDb.objectStoreNames.contains("favorit")) {
		var objectStore = upgradeDb.createObjectStore("favorit", { keyPath: "id" });
		objectStore.createIndex("shortName", "shortName", { unique: false });
	}
});




const putTeamInfo = async () => {

  let firstResponse = await fetchApi (base_url + "competitions/2021/standings/");
  let firstResult   = await firstResponse.json();
  let teamList      = firstResult.standings[0].table;

  for (const obj of teamList) {

    let item = {
        id: obj.team.id,
        name: obj.team.name,
        crestURL: obj.team.crestUrl,
        position: obj.position,
        goalDifference: obj.goalDifference,
        points: obj.points,
        result: obj.result
    };

    dbPromise.then( (db) => {
        let tx = db.transaction('teamInfo', 'readwrite');
        let store = tx.objectStore('teamInfo');

        store.put(item);
        return tx.complete;
    }).catch( () => {
        console.log('item gagal disimpan.')
    });

 }

}

// VERY VERY PATCHY SMH
const putTeamInfoCheck = async () => {

  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get(73);
  }).catch(
    () => {putTeamInfo()}
  )

}

const handleLawanPage = async () => {
  await putTeamInfoCheck()

  // mengolah data team Hotspur, id=73
  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get(73);
  }).then((spurs) => {

    // memuat ke halaman html
    // document.getElementById('teamCrest-spurs').innerHTML = `<img class="responsive-img" src=${spurs.crestURL} alt="team crest" >`
    // document.getElementById('selectTeam-spurs').innerText = spurs.name
    // document.getElementById('position-spurs').innerText = spurs.position
    // document.getElementById('goalDifference-spurs').innerText = spurs.goalDifference
    // document.getElementById('points-spurs').innerText = spurs.points

    let textHTML = `
    <div class="row dotted">
      <div class="col s3 m2 l2 teamCrest dotted" id="teamCrest-spurs">
        <img class="responsive-img" src=${spurs.crestURL} alt="team crest" >
      </div>
      <div class="col s9 m5 l5 dotted height-150">
        <div id="teamNameColumn-spurs">
          <div id="selectTeam-spurs">
            ${spurs.name}
          </div>
       </div>

        <div class="row">
          <div class="col position" >
            <div>Peringkat</div>
            <div id="position-spurs">${spurs.position}</div>
          </div>
          <div class="col goalDifference" >
            <div>Selisih Gol</div>
            <div id="goalDifference-spurs">${spurs.goalDifference}</div>
          </div>
          <div class="col points">
            <div>Poin</div>
            <div id="points-spurs">${spurs.points}</div>
          </div>
        </div>
      </div>

      <div class="col s12 m5 l5 dotted height-150" id="kolomForm-spurs">
        <div>Performa 5 laga terakhir</div>
        <div id="overallForm-spurs" class="row"></div>
        <a class="waves-effect waves-light btn-small red darken-2" onClick="addFavorite(${spurs.id})">
          Favoritkan
        </a>
      </div>
    </div>
    `;


    document.getElementById('forSpurs').innerHTML = textHTML

    // menyimpan data baru ke idb
    getTeamForm(spurs, "overallForm-spurs")

  }).catch(error);

  // info team placeholder
  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.getAll();
  }).then( (items) => {
    let selectTeam = ""

    items.forEach( (obj) => {
      selectTeam += `
        <option value=${obj.id}>${obj.name}</option>
      `
    });

    // document.getElementById("selectTeam").innerHTML = selectTeam
    // document.getElementById('teamCrest').innerHTML = `<img class="responsive-img" src=${items[0].crestURL} alt="team crest" >`
    // document.getElementById('position').innerText = items[0].position
    // document.getElementById('goalDifference').innerText = items[0].goalDifference
    // document.getElementById('points').innerText = items[0].points

    let textHTML = `
      <div class="row dotted">
        <div class="col s3 m2 l2 teamCrest dotted" id="teamCrest">
          <img class="responsive-img" src=${items[0].crestURL} alt="team crest" >
        </div>
        <div class="col s9 m5 l5 dotted height-150">
          <div class="input-field col s12 " id="teamNameColumn">
           <select class="browser-default" id="selectTeam" onchange="loadSingleTeamInfo()">
            ${selectTeam}
           </select>
         </div>

          <div class="row">
            <div class="col position" >
              <div>Peringkat</div>
              <div id="position">${items[0].position}</div>
            </div>
            <div class="col goalDifference" >
              <div>Selisih Gol</div>
              <div id="goalDifference">${items[0].goalDifference}</div>
            </div>
            <div class="col points">
              <div>Poin</div>
              <div id="points">${items[0].points}</div>
            </div>
          </div>
        </div>

        <div class="col s12 m5 l5 dotted height-150" id="kolomForm">
          <div>Performa 5 laga terakhir</div>
          <div id="overallForm" class="row"></div>
          <a class="waves-effect waves-light btn-small red darken-2" onClick="addFavorite(${items[0].id})">
            Favoritkan
          </a>
        </div>
      </div>
    `;

    document.getElementById('forOppositionTeams').innerHTML = textHTML

    getTeamForm(items[0], "overallForm")

  }).catch(error);

}


const getTeamForm = async (object, targetDivId) => {
  let item = {
      id: object.id,
      name: object.name,
      crestURL: object.crestURL,
      position: object.position,
      goalDifference: object.goalDifference,
      points: object.points,
      form: object.form
  };


  if ( typeof item.form === 'undefined' ) {
    await fetchData(
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
            default: formItem.result = "unavailable"
          }

          form.push(formItem)

        }

        item.form = form

        function classNamer (point)  {
          if (point===3) {
            return "menang"
          } else if (point ===1) {
            return "seri"
          } else {
            return "kalah"
          }
        }

        let formHTML = ''
        item.form.forEach( obj => {
          formHTML += `
            <div class="col l2 matchResult ${classNamer(obj.point)}">${obj.result}</div>
          `
        })

        document.getElementById(targetDivId).innerHTML = formHTML

      })

    await dbPromise.then( (db) => {
        let tx = db.transaction('teamInfo', 'readwrite');
        let store = tx.objectStore('teamInfo');
        store.put(item);
        return tx.complete;
    })
    .catch( () => {
        console.log('item spurs gagal disimpan.')
    });

  } else {

    let formHTML = ''
    item.form.forEach( obj =>{
      formHTML += `
        <div class="col l2 matchResult ${classNamer(obj.point)}">${obj.result}</div>
      `
    })
    document.getElementById(targetDivId).innerHTML = formHTML
  }
}

const loadSingleTeamInfo = () => {
  var x = document.getElementById("selectTeam").value;

  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get( parseInt(x) );
  }).then( (data)=>{

    document.getElementById('teamCrest').innerHTML = `<img class="responsive-crest" src=${data.crestURL} alt="team crest" >`
    document.getElementById('position').innerText = data.position
    document.getElementById('goalDifference').innerText = data.goalDifference
    document.getElementById('points').innerText = data.points

    let textHTML = `
    <div>Performa 5 laga terakhir</div>
    <div id="overallForm" class="row"></div>
    <a class="waves-effect waves-light btn-small red darken-2" onClick="addFavorite(${data.id})">
      Favoritkan
    </a>
    `
    document.getElementById('kolomForm').innerHTML = textHTML

    getTeamForm(data, "overallForm")
  })
}


const consoleLog = () => {
  fetchData(`${base_url}teams/73`,
    (data) => {console.log(data)}
  )
  putTeamInfoCheck();
}

const addFavorite = async (id) => {
  console.log(id)
  let rsp      = await fetchApi (base_url + `teams/${id}/`);
  let result   = await rsp.json();

  console.log(result)

  dbPromise.then(function(db) {
    var tx = db.transaction('favorit', 'readwrite');
    var store = tx.objectStore('favorit');
    return store.put( result );
  })

}

const loadFavorit = () => {
  dbPromise.then( db => {
    var tx = db.transaction('favorit', 'readonly');
    var store = tx.objectStore('favorit');
    return store.getAll();
  }).then( data => {

    let cards = ''

    for (obj of data) {

      let activeCompetitions = ``

      obj.activeCompetitions.forEach((x)=>{
        activeCompetitions += `<li>${x.name}, ${x.area.name}</li>`
      })

      cards += `
      <div class="col sm12 m6 l4">
        <div class="card hoverable">
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" src=${obj.crestUrl}>
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4">${obj.shortName}<i class="material-icons right">more_vert</i></span>
            <p><a href=${obj.website}>ke website!</a></p>
          </div>
          <div class="card-reveal">
            <span class="card-title grey-text text-darken-4">${obj.name}<i class="material-icons right">close</i></span>

            <p>
              Venue: ${obj.venue} <br/>
              Tahun berdiri: ${obj.founded}
            </p>
            <span>Kompetisi aktif:</span>
            <ul>
              ${activeCompetitions}
            </ul>
            <p>
              Contact: <br/>
              ${obj.phone} <br/>
              ${obj.email}
            </p>
            <a class="waves-effect waves-light btn-small red darken-2" onClick="removeFavorite(${obj.id})">
              Hapus
            </a>
          </div>

        </div>
      </div>
      `
    }

    document.getElementById('favoriteCards').innerHTML = cards

  }).catch(error)
}

const removeFavorite = async (id) => {

  await dbPromise.then(function(db) {
    var tx = db.transaction('favorit', 'readwrite');
    var store = tx.objectStore('favorit');
    store.delete(id);
    return tx.complete;
  }).then(function() {
    console.log('Item deleted');
  });

  loadFavorit()

}
