
if (!('serviceWorker' in navigator)) {
  console.log("Service worker tidak didukung browser ini.");
} else {
  registerServiceWorker();
  requestPermission();
}

function registerServiceWorker() {
  return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      console.log('Registrasi service worker berhasil.');
      return registration;
    })
    .catch(function(err) {
      console.error('Registrasi service worker gagal.', err);
    });
}

function requestPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(function(result) {
      if (result === "denied") {
        console.log("Fitur notifikasi tidak diijinkan.");
        return;
      } else if (result === "default") {
        console.error("Pengguna menutup kotak dialog permintaan ijin.");
        return;
      }

      if (('PushManager' in window)) {
          navigator.serviceWorker.getRegistration().then(function(registration) {
              registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(myKeys.publicKey)
              }).catch(function(e) {
                  console.error('Tidak dapat melakukan subscribe ', e.message);
              });
          });
      }
    });
  }
}

const myKeys = {"publicKey":"BPk7Dm3OUVCopb5Csu7MbBHZ66UNN6dWwK9kBmZUivzpqx-DfIponSUPWTvffLxaSi0nMiCGDUluDYPeFWRAslU",
                   "privateKey":"hHIewAH-WWCSBuf-HCgbPFkHMYSslA3tVB-rXXbQ6us"}

function urlBase64ToUint8Array(base64String) {
 const padding = '='.repeat((4 - base64String.length % 4) % 4);
 const base64 = (base64String + padding)
     .replace(/-/g, '+')
     .replace(/_/g, '/');
 const rawData = window.atob(base64);
 const outputArray = new Uint8Array(rawData.length);
 for (let i = 0; i < rawData.length; ++i) {
     outputArray[i] = rawData.charCodeAt(i);
 }
 return outputArray;
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
            .forEach(function(elm) {
              elm.innerHTML = text;
            });
        }
      )
      .then(
        () => {
          document.querySelectorAll('.sidenav a, .topnav a')
            .forEach(function(elm) {
              elm.addEventListener('click', function(event) {
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
  if (page == '') page = 'laga';
  loadPage(page);


  async function loadPage(page) {
    await fetch('pages/' + page + '.html')
      .then(res => res.text())
      .then(text => {
        document.querySelector(".body-content").innerHTML = text
      })
      .catch(rsp => console.log("error: " + rsp.status));

    await loadContent(page)
  }

  function loadContent(page) {
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
      case "favorit":
        loadFavorit();
        break;
      default:
        () => {document.querySelector(".body-content").innerHTML = "Error: 404"}
    }
  }

});
