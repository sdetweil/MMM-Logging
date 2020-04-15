/* global Module */

/* Magic Mirror
 * Module: MMM-Logging
 *
 * By shbatm
 * MIT Licensed.
 */

/* jshint esversion: 6 */

Module.register("MMM-Logging", {
    defaults: {
        useColor: true,
        format: "{{timestamp}} <{{title}}> {{message}} ({{folder}}/{{file}}:{{line}} {{method}})",
        overwriteConsoleMethods: true,
        overwriteBrowserMethods: true,
        echoModuleNotifications: 'notification',
        echoLocal:true,
        echoRemote:false,
        echoErrors: true,
        dateformat: "yyyy-mm-dd'T'HH:MM:ss",
        ignoreModules: [ 'calendar', 'newsfeed', 'clock' ]
    },

    requiresVersion: "2.1.0", // Required version of MagicMirror

    start: function() {
        var self=this;
        this.sendSocketNotification("INITIALIZE_LOGGING", this.config);
        if (this.config.overwriteBrowserMethods) {
            this.config.overwriteConsoleMethods = true;
            // Overwrite the Main Console
            this.console = Tracer.console(this.config);
            // Overwrite MagicMirror's Log functions.
            Log.log = (x) => { if(self.config.echoRemote)this.sendSocketNotification("LOG_TO_CONSOLE",x); if(self.config.echoLocal) console.log(x)};
            Log.info = (x) => { if(self.config.echoRemote)this.sendSocketNotification("INFO_TO_CONSOLE",x); if(self.config.echoLocal) console.info(x)};
            Log.warn = (x) => { if(self.config.echoRemote)this.sendSocketNotification("WARN_TO_CONSOLE",x); if(self.config.echoLocal) console.warn(x)};
            Log.error = (x) => { if(self.config.echoRemote)this.sendSocketNotification("ERROR_TO_CONSOLE",x); if(self.config.echoLocal) console.error(x)};
            Log.debug = (console.debug || console.log);
        }
        console.info("MMM-Logging updated window.console.");

        if (this.config.echoErrors) {
            console.error = (text) => {
                this.sendSocketNotification("BROWSER_ERROR", text);
                this.console.error(text);
            };
            window.addEventListener('error', (event) => {
                this.sendSocketNotification("BROWSER_ERROR", event);
            });
        }
        this.initialized = true;
    },

    getScripts: function() {
        return ['tracer-bundle.js'];
    },

    getStyles: function() {
        return [];
    },

    // socketNotificationReceived from helper
    socketNotificationReceived: function(notification, payload) {
        // Do nothing.
    },

    notificationReceived: function(notification, payload, sender) {
        if (this.config.echoModuleNotifications) {
            if (sender && this.config.ignoreModules && this.config.ignoreModules.indexOf(sender.name) !== -1) { return; }
            this.sendSocketNotification("NOTIFICATION_TO_CONSOLE", {
                notification: notification,
                payload: (payload && this.config.echoModuleNotifications === "payload") ? payload : undefined,
                sender: (sender) ? sender.name : undefined
            });
        }
    },

});
