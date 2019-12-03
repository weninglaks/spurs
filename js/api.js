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


const putTeamInfo = async () => {
  let firstResponse = await fetch (base_url + "competitions/2021/standings/",
                      {
                        method : "GET",
                        headers: {
                                  "X-Auth-Token": "f5fab0e8ba8b41b8a65ccec3b7778e07"
                                 }
                      });
  let firstResult  = await firstResponse.json();
  let teamList     = firstResult.standings[0].table

  for (let i=0; i < teamList.length; i++) {
    // let res = await fetch ( base_url +`teams/${teamList[i].team.id}/matches?status=FINISHED`,
    //                       {
    //                         method  : "GET",
    //                         headers : {
    //                                   "X-Auth-Token": "f5fab0e8ba8b41b8a65ccec3b7778e07"
    //                                  }
    //                       });
    //
    // let lastFive = await res.json();

    dbPromise.then( (db) => {
        let tx = db.transaction('teamInfo', 'readwrite');
        let store = tx.objectStore('teamInfo');
        let item = {
            id: teamList[i].team.id,
            name: teamList[i].team.name,
            crestURL: teamList[i].team.crestUrl,
            position: teamList[i].position,
            goalDifference: teamList[i].goalDifference,
            points: teamList[i].points,
            // form : lastFive
        };
        store.put(item);
        return tx.complete;
    }).then( () => {
        console.log('item berhasil disimpan.')
    }).catch( () => {
        console.log('item gagal disimpan.')
    })
 }

}


const handleLawanPage = async () => {
  await dbPromise.then(function(db) {
    db.transaction("teamInfo").objectStore("teamInfo").openCursor("73").onsuccess = function(e) {
      var cursor = e.target.result;
      if (cursor) { // key already exist
       console.log(success)
      } else { // key not exist
       console.log(error)
      }
    };
  });

  // mengolah data team Hotspur

  await dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.get(73);
  }).then(function(spurs) {
      console.log(spurs)
      fetchData(
        `${base_url}teams/73/matches?status=FINISHED`,
        data => {

          dbPromise.then( (db) => {
              let tx = db.transaction('teamInfo', 'readwrite');
              let store = tx.objectStore('teamInfo');
              let item = {
                  id: spurs.id,
                  name: spurs.name,
                  crestURL: spurs.crestURL,
                  position: spurs.position,
                  goalDifference: spurs.goalDifference,
                  points: spurs.points,
                  form : data
              };
              store.put(item);
              return tx.complete;
          }).catch( () => {
              console.log('item spurs gagal disimpan.')
          });

          document.getElementById('teamCrest-spurs').innerHTML = `<img src=${spurs.crestURL} alt="team crest">`
          document.getElementById('selectTeam-spurs').innerText = spurs.name
          document.getElementById('position-spurs').innerText = spurs.position
          document.getElementById('goalDifference-spurs').innerText = spurs.goalDifference
          document.getElementById('points-spurs').innerText = spurs.points

        }
      );

  });


  await dbPromise.then(function(db) {
    var tx = db.transaction('teamInfo', 'readonly');
    var store = tx.objectStore('teamInfo');
    return store.getAll();
  }).then(function(items) {
    let selectTeam = ""

    items.forEach( (obj) => {
      selectTeam += `
        <option value=${obj.id} >${obj.name}</option>
      `
    });
    document.getElementById("selectTeam").innerHTML = selectTeam
    document.getElementById('teamCrest').innerHTML = `<img src=${items[0].crestURL} alt="team crest">`
    document.getElementById('position').innerText = items[0].position
    document.getElementById('goalDifference').innerText = items[0].goalDifference
    document.getElementById('points').innerText = items[0].points

  });

}
