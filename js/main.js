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

document.addEventListener("DOMContentLoaded", function() {


  // getLeagueStanding();
  // getTeamInfo().then(console.log("selesai menyimpan"))
  // consoleLog()
  putTeamInfo()


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


  function loadPage (page) {
    fetch('pages/'+page+'.html')
      .then( res => res.text())
      .then( text => {
        document.querySelector(".body-content").innerHTML = text
      })
      .then(
        loadContent(page)
      )
      .catch( rsp => console.log("error: " + rsp.status));
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
        console.log("lawan")
        handleLawanPage();
        break;
      default: getUpcomingMatches()
    }
  }


  // Close the dropdown menu if the user clicks outside of it
  //
  // window.onclick = function(event) {
  // if (!event.target.matches('.dropbtn')) {
  //   var dropdowns = document.getElementsByClassName("dropdown-content");
  //   var i;
  //   for (i = 0; i < dropdowns.length; i++) {
  //     var openDropdown = dropdowns[i];
  //     if (openDropdown.classList.contains('show')) {
  //       openDropdown.classList.remove('show');
  //     }
  //   }
  // }
  // }



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

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
document.getElementById("myDropdown").classList.toggle("show");
console.log("pressed")
}
