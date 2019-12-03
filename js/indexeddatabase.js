var dbPromise = idb.open("spurs_info_db", 2, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains("teamInfo")) {
    upgradeDb.createObjectStore("teamInfo", {keyPath: 'id'});
  }
});
