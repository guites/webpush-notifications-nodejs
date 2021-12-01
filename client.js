let isPushEnabled = false;
let pushButton = document.querySelector('#notifications-button');
const vapidPublicKey = "BLRiZGyto4qhMHTO1-c5bFZ7Ex21fjIQcHuYEElsihbPK4bjDh8KuZsFjgWNPNProEvoUQvvJlNq5fvw6HYvsB0";

window.addEventListener('load', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./worker.js')
        .then(initialiseState);

        pushButton.addEventListener('click', function() {
            if (isPushEnabled) {
                unsubscribe();
            } else {
                subscribe();
            }
        });

    } else {
        alert('Service workers aren\'t supported in this browser.');
    }

});

// Once the service worker is registered set the initial state
function initialiseState() {
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      alert("Notifications aren't supported!");
      return;
    }
  
    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (Notification.permission === 'denied') {
      alert('The user has blocked notifications.');
      return;
    }
  
    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      alert('Push messaging isn\'t supported.');
      return;
    }
  
    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      // Do we already have a push message subscription?
      serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {
          // Enable any UI which subscribes / unsubscribes from
          // push messages.
          pushButton.disabled = false;
          if (!subscription) {
            // We aren’t subscribed to push, so set UI
            // to allow the user to enable push
            console.log('client isnt subscribed to push');
            return;
          }
  
          // Keep your server in sync with the latest subscription
          sendSubscriptionToServer(subscription);
  
          // Set your UI to show they have subscribed for
          // push messages
          pushButton.textContent = 'Disable Push Messages';
          pushButton.disabled = false;
          isPushEnabled = true;
        })
        .catch(function(err) {
          alert('Error during getSubscription()', err);
        });
    });
  }

function subscribe() {
    // Disable the button so it can't be changed while
    // we process the permission request
    pushButton.disabled = true;

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidPublicKey })
            .then(function (subscription) {
                // The subscription was successful
                isPushEnabled = true;
                pushButton.textContent = 'Disable Push Messages';
                pushButton.disabled = false;

                // TODO: Send the subscription subscription.endpoint
                // to your server and save it to send a push message
                // at a later date
                return sendSubscriptionToServer(subscription);
            })
            .catch(function (e) {
                if (Notification.permission === 'denied') {
                    // The user denied the notification permission which
                    // means we failed to subscribe and the user will need
                    // to manually change the notification permission to
                    // subscribe to push messages
                    alert('Permission for Notifications was denied');
                    pushButton.disabled = true;
                } else {
                    // A problem occurred with the subscription, this can
                    // often be down to an issue or lack of the gcm_sender_id
                    // and / or gcm_user_visible_only
                    alert('Unable to subscribe to push.', e);
                    pushButton.disabled = false;
                    pushButton.textContent = 'Enable Push Messages';
                }
            });
    });
}



async function sendSubscriptionToServer(subscription) {
    await fetch('/subscribe', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription)
    });
}

async function sendUnsubToServer(subscription) {
    console.log(subscription);
    return;
    await fetch('/unsubscribe', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription)
    });
}

function unsubscribe() {
    pushButton.disabled = true;

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        // To unsubscribe from push messaging, you need get the
        // subcription object, which you can call unsubscribe() on.
        serviceWorkerRegistration.pushManager.getSubscription().then(
            function (pushSubscription) {
                // Check we have a subscription to unsubscribe
                if (!pushSubscription) {
                    // No subscription object, so set the state
                    // to allow the user to subscribe to push
                    isPushEnabled = false;
                    pushButton.disabled = false;
                    pushButton.textContent = 'Enable Push Messages';
                    return;
                }

                // since the client has blocked push messaging, this call to sendUnsubToServer should verify against
                // user ID or some other identifier to remove from the database,
                // not necessarily pass the return from getSubscription
                
                // TO-DO: check if every endpoint is unique to each client. in this case, I can use it as index
                // to identify in database

                sendUnsubToServer(pushSubscription);

                // We have a subcription, so call unsubscribe on it
                pushSubscription.unsubscribe().then(function () {
                    pushButton.disabled = false;
                    pushButton.textContent = 'Enable Push Messages';
                    isPushEnabled = false;
                }).catch(function (e) {
                    // We failed to unsubscribe, this can lead to
                    // an unusual state, so may be best to remove
                    // the subscription id from your data store and
                    // inform the user that you disabled push

                    alert('Unsubscription error: ', e);
                    pushButton.disabled = false;
                });
            }).catch(function (e) {
                alert('Error thrown while unsubscribing from ' +
                    'push messaging.', e);
            });
    });
}
  
