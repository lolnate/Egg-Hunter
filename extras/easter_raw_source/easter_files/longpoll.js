// Support code for maintaining a persistent long-poll connection.
//
// Long-polling works by first establishing an iframe channel over
// which to send the Ajax requests. This is done with
// longpoll.whenChannelUp("someid", callback). Then
// longpoll.channels["someid"].poll represents the poller, and
// poll.callbacks.args and poll.callbacks.success must be defined.
//
// "args" should return a jQuery.ajax parameter object for sending to
// the server (this is slightly massaged by the long-poll code and
// success/error callbacks are added).
//
// "success" gets the data returned by the server when a long-poll
// returns. It should simply use that data - a new poll is
// automatically rescheduled by longpoll.js.
//
// One can also supply a "failure" callback which is called with true
// in case of prolonged failures and false if said failure state is
// cleared.
//
// To get rid of a persistent long-poll again, use
// longpoll.removeChannel("someid").


var longpoll = {
    timeout: 5 * 60,     // timeout for each long poll in seconds
    transferredCookies: ['PHPSESSID', 'secret'],

    channels: {},        // the channels we know about
    
    whenChannelUp: null, // call to get callback when Ajax channel is up
    removeChannel: null, // remove channel, aborting poll if necessary

    inactive: false, // whether long-polling is currently deactivated due to user inactivity
    inactiveCallbacks: [] // list of functions to be called when inactivity sets in
};


(function () {
    // local shortcut
    channels = longpoll.channels;

    // call callback when we're connected to channel with id, this
    // might be immediately, or after some time if we need to wait for
    // the channel being created
    longpoll.whenChannelUp = function (channelId, callback) {
        if (channels[channelId]) {
            if (channels[channelId].channel != null)
                callback(channelId);
            else
                channels[channelId].waitingForChannelUp.push(callback);
        }
        else {
            createChannel(channelId);
            channels[channelId].waitingForChannelUp = [ callback ];
            connectChannel(channelId);
        }
    };

    // abort poll for channel and remove it
    longpoll.removeChannel = function(channelId) {
        var s = channels[channelId];
        if (!s)
            return;
        
        delete channels[channelId];
            
        if (s.poll.handle)
            s.poll.handle.abort();

        if (s.frameName)
            jQuery("body > iframe[name=" + s.frameName + "]").remove();
    };

    // setup an ajax channel in a double-inner iframe, calls callback
    // with a channel function that can be used to do an Ajax request on a
    // subdomain
    function setupChannelIframes(callback) {
        if (navigator.userAgent.indexOf("MSIE") == -1)
            document.domain = window.location.hostname;
        
        // create trampoline that sets its document.domain to be
        // able to talk to the actual channel iframe
        var frameName = 'f' + (Math.random() + "").substring(2, 8);
        jQuery('<iframe src="/js/channel/trampoline.html" name="' + frameName + '" style="position:absolute;left:-10000px"></iframe>')
            .load(function () { window.frames[frameName].setup(callback); })
            .appendTo(document.body);
        
        return frameName;
    }

    function createChannel(channelId) {
        channels[channelId] = {
            ajax: null,    // ajax function appears when channel is up

            channel: null,      // iframe Ajax channel
            frameName: null,    // name of iframe
            
            poll: {             //  a permanent long-poller
                schedule: null, // do poll soonish, function appears when channel is up
                
                handle: null,   // the Ajax object, used for abortion
                failHappened: null,    // when did last error occur
                scheduleTimeout: null, // timer for scheduling new poll
                successWaitTime: 1500, // how long to wait on successful poll until repoll
                lastActivity: new Date(),

                callbacks: {
                    // called whenever we need to setup an Ajax,
                    // should return argument with data, url, etc. for
                    // Ajax call or null if we're not ready to poll at
                    // the moment
                    args: null,
                    // called whenever a poll returns successfully (a new
                    // poll will be automatically rescheduled)
                    success: null,
                    // called with true when a longer failure is occurring,
                    // called with false when there's no failure
                    failure: function (failed) {}
                }
            }
        };
    }
        
    function connectChannel(channelId) {
        console.log("Creating channel channel", channelId);
        channels[channelId].frameName = setupChannelIframes(function (channel) {
            if (!channels[channelId])
                return;

            channels[channelId].channel = channel;
            
            // make Ajax request on channel with options, transfering
            // useful cookies
            channels[channelId].ajax = function (options) {
                var cookies = {};
                jQuery.each(longpoll.transferredCookies, function (i, c) {
                    cookies[c] = jQuery.cookie(c);
                });

                var abort = channels[channelId].channel(options, cookies);
    
                // pack abort in nicely, we can't return the real xhr object
                // since it's in the (inaccessible) iframe
                return { abort: abort };
            };

            // schedule a poll on this channel, .callbacks must have
            // been setup first
            channels[channelId].poll.schedule = function(millisecs) {
	        console.log("Scheduling poll on", channelId);
                // make sure we're the only one running
                if (channels[channelId].poll.scheduleTimeout)
                    clearTimeout(channels[channelId].poll.scheduleTimeout);
                
                // randomize a bit to avoid lemming effect
                millisecs *= (0.75 + Math.random() * 0.5);
        
                channels[channelId].poll.scheduleTimeout = setTimeout(function () {
                    if (channels[channelId]) {
                        channels[channelId].poll.scheduleTimeout = null;
                        pollChannel(channelId);
                    }
                }, millisecs);
            };
            
	    console.log("Created channel to channel", channelId);

            jQuery.each(channels[channelId].waitingForChannelUp, function (i, cb) {
                cb(channelId);
            });
            
            delete channels[channelId].waitingForChannelUp;
        });
    }
    
    function pollChannel(channelId) {
        var s = channels[channelId];
        if (!s || !s.ajax || !s.poll.callbacks.args || longpoll.inactive)
            return;
        
        if (s.poll.handle) {
             // abort() doesn't trigger error handler so this doesn't
             // get us into trouble
            s.poll.handle.abort();
            s.poll.handle = null;
        }

        // if we just had a real error, we lower the timeout so we can
        // detect faster whether everything is OK now (if we get an
        // error, no harm is done, the timeout didn't matter; if we
        // get a timeout, then we assume everything is fine and go
        // back to the usual long timeout)
        var timeout = s.poll.failHappened != null ? 30 : longpoll.timeout;
        // randomize to avoid lemming effect
        timeout *= 0.7 + 0.6 * Math.random();

        var args = s.poll.callbacks.args(channelId);
        if (!args)
            return;

        args.cache = false;
        args.success = function (res) { onPollSuccess(channelId, res); };
        args.error = function (xml, reason, err) { onPollError(channelId, xml, reason, err); };
        args.timeout = timeout * 1000;
        
        s.poll.handle = s.ajax(args);
    }
    
    function onPollSuccess(channelId, data) {
        var s = channels[channelId];
        if (!s)
            return;

        s.poll.lastActivity = new Date();
        s.poll.failHappened = null;
        s.poll.handle = null;

        s.poll.callbacks.failure(false);

        console.log("Poll request returns success, channel", channelId);

        try {
            s.poll.callbacks.success(data);
        }
        catch (err) {
            console.log("Error when executing poll success", err);
            onPollError(channelId, null, "error", err);
            throw err;
        }

        s.poll.schedule(s.poll.successWaitTime);
    }

    function onPollError(channelId, XMLHttpRequest, status, errorThrown) {
        var s = channels[channelId];
        if (!s)
            return;
        
        s.poll.lastActivity = new Date();
        s.poll.handle = null;
        
        // possible reasons for error: timeout, lost connection, navigating away

        if (status == "timeout") {
            // timeout generally means we're good, there just wasn't
            // anything to report in the other end, so just reschedule
            console.log("Timeout, reconnecting");
            s.poll.failHappened = null;
            s.poll.callbacks.failure(false);
            s.poll.schedule(300);
            return;
        }
        
        if (s.poll.failHappened == null)
            s.poll.failHappened = new Date();

        var secondsSince = ((new Date()).getTime() - s.poll.failHappened.getTime()) / 1000;
        if (secondsSince > 60)
            s.poll.callbacks.failure(true);
        else
            s.poll.callbacks.failure(false);

        // next try is simply seconds since last fail, clamped
        var nextTry = Math.max(4, Math.min(secondsSince, 4 * 60));
        console.log("Error", status, errorThrown, ", next try in appr. " + nextTry.toFixed(1) + " seconds");

        s.poll.schedule(nextTry * 1000);
    }

    // monitoring user and poll health
    var lastUserActivity = new Date();
    var monitorInterval = null;
    var monitorIntervalTime = 6 * 60;
    var maxInactivityTime = 30 * 60;

    function userActivityOccurred() {
        lastUserActivity = new Date();
        if (longpoll.inactive) {
            console.log("User went active again");
            longpoll.inactive = false;
            for (var channelId in channels)
                pollChannel(channelId);
        }
    }
    
    // listen for events and update user activity timestamp accordingly
    longpoll.startMonitoring = function () {
        // listen for user activity
        jQuery(document).ready(function () {
            jQuery(document.body)
                .keypress(userActivityOccurred)
                .click(userActivityOccurred);

            if (!monitorInterval)
                monitorInterval = setInterval(monitor, monitorIntervalTime * 1000);
        });
    };

    longpoll.stopMonitoring = function () {
        // stop user-activity monitoring
        jQuery(document.body)
            .unbind('keypress')
            .unbind('click');

        clearInterval(monitorInterval);
        monitorInterval = null;
    };


    function monitor() {
        if (longpoll.inactive)
            return;
        
        function secondsSince(t) {
            return (new Date().getTime() - t.getTime()) / 1000;
        }
        
        var inactivity = secondsSince(lastUserActivity);
        console.log("User inactive in", inactivity, "seconds");
        if (inactivity > maxInactivityTime) {
            longpoll.inactive = true;
            console.log("Disabling long polling due to inactivity in", inactivity.toFixed(1), "seconds");
            jQuery.each(longpoll.inactiveCallbacks, function (i, cb) {
                cb(inactivity);
            });
            
            return;
        }
        
        console.log("Monitoring health of long-pollers");
        
        jQuery.each(channels, function (channelId, s) {
            if (s.ajax
                && secondsSince(s.poll.lastActivity) > longpoll.timeout * 2
                && s.poll.callbacks.args())
                s.poll.schedule(300);
        });
    }

    longpoll.startMonitoring();
})();
