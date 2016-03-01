(function () {
    /***
     * App code
     */
    var flashAddon = {
        tel: navigator.mozTelephony,
        flashEnabled: false,
        mozCamera: null,
        appEnabled: true,
        animationLoop: null,

        initialize: function initialize() {
            if (flashAddon.appEnabled === true) {
                this.tel.onincoming = function (e) {
                    if (!flashAddon.flashEnabled) {
                        flashAddon.flashEnabled = true;
                        flashAddon.initFlash();
                    }
                    var incall = e.call;
                    incall.onstatechange = function (e) {
                        flashAddon.stopFlash();
                    };
                };
            }
        },
        notify: function (subject, text, pic, callback) {
            var lastNot = navigator.mozNotification.createNotification(subject,
                text, pic);
            lastNot.onclick = function () {
                callback();
            };
            lastNot.show();
        },
        initFlash: function initFlash() {
            if (flashAddon.flashEnabled) {
                var options = {
                    mode: 'video'
                };

                if (typeof flashAddon.animationLoop != undefined && flashAddon.animationLoop != null) {
                    clearInterval(flashAddon.animationLoop);
                } if (flashAddon.mozCamera != null) {
                    flashAddon.mozCamera.release();
                }

                var cameraId = window.navigator.mozCameras.getListOfCameras()[0];

                console.log('get camera');
                window.navigator.mozCameras.getCamera(cameraId, options)
                    .then(function (result) {
                        console.log('set flash on');
                        flashAddon.mozCamera = result.camera;
                        flashAddon.mozCamera.flashMode = 'torch';
                    }, function (error) {
                        console.log(error);
                    }).catch(function (e) {
                        console.log('catch', e);
                    });
                flashAddon.animationLoop = setInterval(flashAddon.initFlash, 2000);
            }
        },
        stopFlash: function stopFlash() {
            if (flashAddon.flashEnabled || flashAddon.mozCamera != null) {
                console.log('release camera');
                flashAddon.flashEnabled = false;
                if (flashAddon.mozCamera != null) { flashAddon.mozCamera.release(); }
                if (typeof flashAddon.animationLoop != undefined && flashAddon.animationLoop != null) { clearInterval(flashAddon.animationLoop); }
            }
        }
    };
    // If injecting into an app that was already running at the time
    // the app was enabled, simply initialize it.
    if (document.documentElement) {
        flashAddon.initialize();
    }

    // Otherwise, we need to wait for the DOM to be ready before
    // starting initialization since add-ons are injected
    // *before* `document.documentElement` is defined.
    else {
        window.addEventListener('DOMContentLoaded', flashAddon.initialize);
    }

    navigator.mozApps.mgmt.addEventListener('enabledstatechange', function (event) {
        var app = event.application;
        if (app.manifest.name === 'Flash') {
            var wasEnabled = app.enabled;
            // do something with this information
            if (wasEnabled === true) {
                flashAddon.appEnabled = true;
                flashAddon.initialize();
            } else {
                flashAddon.appEnabled = false;
                flashAddon.stopFlash();
            }
        }
    });
} ());