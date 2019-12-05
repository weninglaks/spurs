var webPush = require('web-push');

const vapidKeys = {
   "publicKey": "BPk7Dm3OUVCopb5Csu7MbBHZ66UNN6dWwK9kBmZUivzpqx-DfIponSUPWTvffLxaSi0nMiCGDUluDYPeFWRAslU",
   "privateKey": "hHIewAH-WWCSBuf-HCgbPFkHMYSslA3tVB-rXXbQ6us"
};


webPush.setVapidDetails(
   'mailto:example@example.com',
   vapidKeys.publicKey,
   vapidKeys.privateKey
)

var pushSubscription = {
   "endpoint": "https://fcm.googleapis.com/fcm/send/eOTZVvHaBug:APA91bG_RUL0q-6pMeLcLZuZBX2G4PUQaC1w9bPrh-UwL7ds0o_ODlEg09HWNnOHnQSrsuccm0yL32Ck0UHJHk9NKqD6vWvp5bEhdV7hIhXfUloBsj93oi1lprudeH6y0B9aXTRR9fOC",
   "keys": {
       "p256dh": "BAHh8kymmQ3rgQ2grbtckqfYAtPAhAhJPOfvYvbVpB3CkxuFEceSzkNlWqNY8xBiPGWK2JZfuSRADJDB/5st9tQ=",
       "auth": "R1W49aJSKMogHwivlz2Gbg=="
   }
};



var payload = "Tottenham 3 : 2 Bournemouth";


var options = {
   gcmAPIKey: '331959246420',
   TTL: 60
};

webPush.sendNotification(
   pushSubscription,
   payload,
   options
);
