let dbPromise = idb.open("spurs_info_db", 3, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains("teamInfo")) {
    var objectStore = upgradeDb.createObjectStore("teamInfo", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
  }
  if(!upgradeDb.objectStoreNames.contains("favorit")) {
		var objectStore = upgradeDb.createObjectStore("favorit", { keyPath: "id" });
		objectStore.createIndex("shortName", "shortName", { unique: false });
	}
});



// const putTeamInfo = async () => {
//
//
//   let firstResponse = await fetchApi (base_url + "competitions/2021/standings/");
//   let firstResult   = await firstResponse.json();
//   let teamList      = firstResult.standings[0].table;
//
//   for (const obj of teamList) {
//
//     let item = {
//         id: obj.team.id,
//         name: obj.team.name,
//         crestURL: obj.team.crestUrl,
//         position: obj.position,
//         goalDifference: obj.goalDifference,
//         points: obj.points,
//         result: obj.result
//     };
//
//     dbPromise.then( (db) => {
//         let tx = db.transaction('teamInfo', 'readwrite');
//         let store = tx.objectStore('teamInfo');
//
//         store.put(item);
//         return tx.complete;
//     }).catch( () => {
//         console.log('item gagal disimpan.')
//     });
//
//  }
//
// }
//
// // VERY VERY PATCHY SMH
// const putTeamInfoCheck = async () => {
//
//   let spursExist = false
//
//   await dbPromise.then(function(db) {
//     var tx = db.transaction('teamInfo', 'readonly');
//     var store = tx.objectStore('teamInfo');
//     return store.get(73);
//   }).then((data)=>{
//     spursExist = typeof data === 'undefined' ? false : true
//   })
//   .catch(error)
//
//   if (!spursExist) {putTeamInfo()}
//
// }


const addFavorite = async (id) => {
  console.log(id)
  let rsp      = await fetchApi (base_url + `teams/${id}/`);
  let result   = await rsp.json();

  console.log(result)

  dbPromise.then(function(db) {
    var tx = db.transaction('favorit', 'readwrite');
    var store = tx.objectStore('favorit');
    return store.put( result );
  }).then(
    M.toast({html: 'ditambahkan ke daftar favorit!'})
  ).catch(
    M.toast({html: 'gagal menambahkan daftar favorit!'})
  )

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
            <img class="activator" src=${obj.crestUrl} height="400px">
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4">${obj.shortName}<i class="material-icons right">more_vert</i></span>
            <p><a href=${obj.website} target="_blank">${obj.website.replace("http://","").replace("https://","")}</a></p>
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
            <br/>
            <br/>
            <p>
              Contact: <br/>
              ${obj.phone == null ? '' : obj.phone}
              ${obj.email == null ? '<br/>' : obj.email}
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
    M.toast({html: 'dihapus dari daftar favorit!'})
    console.log('Item deleted');

  });

  loadFavorit()

}
