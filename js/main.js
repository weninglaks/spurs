// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/service-worker.js")
            .catch(function() {
            console.log("Pendaftaran ServiceWorker gagal");
        });
    });
} else {
    console.log("ServiceWorker belum didukung browser ini.");
}


//NOTIFICATION API
if ("Notification" in window) {
      requestPermission();
    } else {
      console.error("Browser tidak mendukung notifikasi.");
    }

    // Meminta ijin menggunakan Notification API
    function requestPermission() {
      Notification.requestPermission().then(function (result) {
        if (result === "denied") {
          console.log("Fitur notifikasi tidak diijinkan.");
          return;
        } else if (result === "default") {
          console.error("Pengguna menutup kotak dialog permintaan ijin.");
          return;
        }

        console.log("Fitur notifikasi diijinkan.");
      });
    }


document.addEventListener("DOMContentLoaded", function() {

  let elems = document.querySelectorAll('.sidenav');
	M.Sidenav.init(elems);
	loadNav();

	function loadNav() {
		fetch("nav.html")
    .then(res => res.text())
    .then(
      text => {
        document.querySelectorAll(".topnav, .sidenav")
				.forEach(function(elm){
					elm.innerHTML = text;
				});
      }
    )
    .then(
      () => {
        document.querySelectorAll('.sidenav a, .topnav a')
				.forEach(function(elm){
					elm.addEventListener('click', function(event){
						// Tutup sidenav
						var sidenav = document.querySelector('.sidenav');
						M.Sidenav.getInstance(sidenav).close();

						// Muat konten halaman yang dipanggil
						page = event.target.getAttribute('href').substr(1);
						loadPage(page);
					});
				});
      }
    )
    .catch(
      () => console.log("error :" + res.status)
    )
	}

	// Load page content
	let page = window.location.hash.substr(1);
	if(page == '') page = 'laga';
	loadPage(page);


  async function loadPage (page) {
    await fetch('pages/'+page+'.html')
      .then( res => res.text())
      .then( text => {
        document.querySelector(".body-content").innerHTML = text
      })
      .catch( rsp => console.log("error: " + rsp.status));

    await loadContent(page)
  }

  function loadContent (page) {
    switch (page) {
      case "laga":
        getUpcomingMatches();
        break;
      case "klasemen":
        getLeagueStanding();
        break;
      case "lawan":
        handleLawanPage();
        break;
      default: () => {document.getElementById("upcomingMatches").innerHTML = matches}
    }
  }




});

const consoleLog = () => {
  fetchData(
    `https://api.football-data.org/v2/teams/73/matches?status=FINISHED`,
    data => {
      let dataReduced = data.matches.slice(-5);
      console.log(dataReduced)
    }
  );
  fetchData(
    `https://api.football-data.org/v2/competitions/2021/standings`,
    data => {
      console.log(data)
    }
  );
}
