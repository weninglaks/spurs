const base_url = "https://api.football-data.org/v2/";


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

function fetchData (url, callback) {
  fetch(url, {
    method: "GET",
    headers: {
        "X-Auth-Token": "f5fab0e8ba8b41b8a65ccec3b7778e07"
    }
  })
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

let dbPromise = idb.open("spurs_info_db", 4, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains("teamInfo")) {
    var bikinTable = upgradeDb.createObjectStore("teamInfo", { keyPath: "id" });
    bikinTable.createIndex("name", "name", { unique: false });
  }
});


const putTeamInfo = async () => {

  let options = { method : "GET",
                  headers: {"X-Auth-Token": "f5fab0e8ba8b41b8a65ccec3b7778e07"}
                }

  let firstResponse = await fetch (base_url + "competitions/2021/standings/", options );
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
    };

    dbPromise.then( (db) => {
        let tx = db.transaction('teamInfo', 'readwrite');
        let store = tx.objectStore('teamInfo');

        store.put(item);
        return tx.complete;
    }).then( () => {
        console.log('item berhasil disimpan.')
    }).catch( () => {
        console.log('item gagal disimpan.')
    });

 }
 console.log('putTeamInfo called.')
}

// const putTeamInfoChecker = async () => {
//
//   dbPromise.then( (db) => {
//     let tx = db.transaction('teamInfo', 'readonly');
//     let store = tx.objectStore('teamInfo');
//     let count = store.count()
//
//     return count.result
//     count.onsuccess = function() {
//       console.log(count.result);
//     }
//   })
//
// }

const handleLawanPage = async () => {
  await putTeamInfo()

  // mengolah data team Hotspur, id=73
  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get(73);
  }).then((spurs) => {

    // memuat ke halaman html
    document.getElementById('teamCrest-spurs').innerHTML = `<img class="responsive-img" src=${spurs.crestURL} alt="team crest" >`
    document.getElementById('selectTeam-spurs').innerText = spurs.name
    document.getElementById('position-spurs').innerText = spurs.position
    document.getElementById('goalDifference-spurs').innerText = spurs.goalDifference
    document.getElementById('points-spurs').innerText = spurs.points

    // menyimpan data baru ke idb
    getTeamForm(spurs, "overallForm-spurs")

  }).catch(error);

  // info team placeholder
  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.getAll();
  }).then(function(items) {
    let selectTeam = ""

    items.forEach( (obj) => {
      selectTeam += `
        <option value=${obj.id}>${obj.name}</option>
      `
    });

    document.getElementById("selectTeam").innerHTML = selectTeam
    document.getElementById('teamCrest').innerHTML = `<img class="responsive-img" src=${items[0].crestURL} alt="team crest" >`
    document.getElementById('position').innerText = items[0].position
    document.getElementById('goalDifference').innerText = items[0].goalDifference
    document.getElementById('points').innerText = items[0].points

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


  if (typeof item.form === 'undefined') {
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
              obj.awayTeam.id === object.id ? formItem.point = 3 : formItem.point = 0
              break;
            case "HOME_TEAM":
              obj.awayTeam.id === object.id ? formItem.point = 0 : formItem.point = 3
              break;
            case "DRAW":
              formItem.point = 1
              break;
            default: formItem.result = "unavailable"
          }

          form.push(formItem)

        }

        item.form = form

        let formHTML = ''
        item.form.forEach( obj =>{
          formHTML += `
            <div class="col l2">${obj.point}</div>
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
        <div>${obj.point}</div>
      `
    })
    document.getElementById(targetDivId).innerHTML = formHTML

  }
}

const loadSingleTeamInfo = () => {
  var x = document.getElementById("selectTeam").value;
  console.log(x)

  dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get( parseInt(x) );
  }).then((data)=>{
    console.log(data)
    document.getElementById('teamCrest').innerHTML = `<img class="responsive-crest" src=${data.crestURL} alt="team crest" >`
    document.getElementById('position').innerText = data.position
    document.getElementById('goalDifference').innerText = data.goalDifference
    document.getElementById('points').innerText = data.points

    getTeamForm(data, "overallForm")
  })
}
