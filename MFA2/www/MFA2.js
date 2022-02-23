var exec = require('cordova/exec');

//exports.coolMethod = function (arg0, success, error) {
//    exec(success, error, 'MFA2', 'coolMethod', [arg0]);
//};

    var exec = require('cordova/exec');
    var channel = require('cordova/channel');


    var MFA = {
        subscribe: function (url,options) {
           (url) ? "" : ( url = "https://meydailysap.meyerwerft.de/logincheck" );
           (options) ? "" : ( options = "location=no,toolbar=no,clearcache=no,clearsessioncache=no" );
            
            setTimeout(()=>{
                
				let ref = cordova.InAppBrowser.open(url, '_blank', options);
                ref.addEventListener('exit', MFA.exitHandler.bind(this, ref));
                ref.addEventListener('loadstop', MFA.loadStopHandler.bind(this, ref));

            }, 2000)
        },
        afterClear: function (url,options) {
            (url) ? "" : ( url = "https://meydailysap.meyerwerft.de/logincheck" );
            (options) ? "" : ( options = "location=no,toolbar=no,clearcache=no,clearsessioncache=no" );
            
            let ref = cordova.InAppBrowser.open(url, '_blank', options);
            ref.addEventListener('exit', MFA.exitHandler.bind(this, ref));
            ref.addEventListener('loadstop', MFA.loadStopHandler.bind(this, ref));

        },
        onOnline: function (url,options) {
            (url) ? "" : ( url = "https://meydailysap.meyerwerft.de/logincheck" );
            (options) ? "" : ( options = "location=no,toolbar=no,clearcache=no,clearsessioncache=no" );
            
			let ref = cordova.InAppBrowser.open(url, '_blank', options);
            ref.addEventListener('exit', MFA.exitHandler.bind(this, ref));
            ref.addEventListener('loadstop', MFA.loadStopHandler.bind(this, ref));
       },
        loadStopHandler: function (ref) {
            // Search for Ping
            ref.executeScript({
                    code: "document.title === 'Logon Success Message';"
                },
                function (values) {
                    var error = true;
                    var errorScript = '';
                    var aPing = values[0];

                    // Ping found
                    if (aPing) {
                        found = true;
                        ref.close();
                        console.log("Ping found");
                        sap.ui.core.BusyIndicator.hide();
                        ref.removeEventListener('loadstop', MFA.loadStopHandler);

                        if (typeof successCallback == 'function') {
                            successCallback(error);
                            AppCache.enablePasscode = origEnablePasscode; // restore the value
                        }

                    }

                    if (!error) { // if error found do not submit credentials again

                        // Autocomplete
                        ref.executeScript({
                            code: formScript
                        }, function (values) {
                            console.log("Submitted credentials " + repetitions);
                        });
                    }


                    // Search for Errors
                    if (errorScript != '') {
                        setTimeout(function () {

                            ref.executeScript({
                                    code: errorScript
                                },
                                function (values) {
                                    var errorText = values[0];

                                    if (errorText !== '' && errorText != null) {
                                        error = true;
                                        sap.ui.core.BusyIndicator.hide();
                                        console.log("Error found");

                                        if (AppCache.BDCshowProcess === 'N') {
                                            ref.removeEventListener('loadstop', MFA.loadStopHandler);
                                            ref.removeEventListener('loaderror', MFA.loadErrorHandler);
                                            ref.removeEventListener('exit', MFA.exitHandler);
                                            ref.close();
                                        } else {
                                            AppCache.enablePasscode = false; // do not store Auth if user corrects in window
                                            ref.show();
                                        }

                                        if (typeof errorCallback == 'function') {
                                            errorCallback(errorText);
                                        }

                                    }
                                });

                        }, 1000);
                    }

                    //repetitions++;

                });

        },

        exitHandler: function (ref) {
            error = true;
            sap.ui.core.BusyIndicator.hide();

            console.log("Exit");
            ref.removeEventListener('loadstop', MFA.loadStopHandler);
            ref.removeEventListener('loaderror', MFA.loadErrorHandler);
            ref.removeEventListener('exit', MFA.exitHandler);
            ref.close();
        },

        loadErrorHandler: function (params, ref) {
            error = true;
            sap.ui.core.BusyIndicator.hide();

            console.log("Load Error: " + params.message);
            ref.removeEventListener('loadstop', MFA.loadStopHandler);
            ref.removeEventListener('loaderror', MFA.loadErrorHandler);
            ref.removeEventListener('exit', MFA.exitHandler);
            ref.close();

            if (typeof errorCallback == 'function') {
                errorCallback(params.message);
            }
        }
    }


channel.onCordovaReady.subscribe(MFA.subscribe);
module.exports = MFA;
