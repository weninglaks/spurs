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
   "endpoint": "https://fcm.googleapis.com/fcm/send/eYTSvU9Q48c:APA91bGVYPXfBX75UPGSlsY0NGJzCVb5uEwImuGLxPGLiIOvfZgwa-fW3ClWSw4_SkEHgI7B-aa2WP9U7F4oi4LKwgefXsqtme6eMyEukv27BI0tQgFuQmkUyU60k9WGO80AW9hvMibB",
   "keys": {
       "p256dh": "BEZN5LwKMxC9JgI1+O3UMF8wkVhgCN8FjCYXMKQdomLziVcNdTi4PrS88teafh8yo7VF1JLyRQJagjrkKzuBscU=",
       "auth": "oXWfWuSduupfi18RhsK8TA=="
   }
};



var payload = "Tottenham 3 : 2 Bournemouth";


var options = {
   gcmAPIKey: '604445819314',
   TTL: 60
};

webPush.sendNotification(
   pushSubscription,
   payload,
   options
);
