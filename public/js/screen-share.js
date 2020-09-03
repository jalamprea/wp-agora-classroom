window.AGORA_SCREENSHARE_UTILS = {
  toggleScreenShareBtn: function () {
    // jQuery('#screen-share-btn').toggleClass('btn-danger');
    jQuery('#screen-share-icon').toggleClass('fa-share-square').toggleClass('fa-times-circle');
  },

  // SCREEN SHARING
  initScreenShare: function (cb) {
    // const client = window.RTC && window.RTC.localStreams ? RTC.localStreams.screen
    if (!window.screenClient) {
      window.screenClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
    }
    window.screenClient.init(agoraAppId, function (e) {
      AgoraRTC.Logger.info("AgoraRTC screenClient initialized", e);
      window.AGORA_SCREENSHARE_UTILS.joinChannelAsScreenShare(cb);
      // window.screenShareActive = true;

      // TODO: add logic to swap button
    }, function (err) {
      AgoraRTC.Logger.error("[SCREEN SHARE ERROR]: AgoraRTC screenClient init failed", err);
      cb(err, null);
    });  
  },

  joinChannelAsScreenShare: function (cb) {
    console.log('Starting screen share...');
    // let userId = window.userID || 0;// window.userID or set to null to auto generate uid on successfull connection
    let userId = 0;// window.userID or set to null to auto generate uid on successfull connection
    const localScreen = window.RTC && window.RTC.localStreams ? RTC.localStreams.screen : window.localStreams.screen;

    var successJoin = function(uid) {
      localScreen.id = uid;  // keep track of the uid of the screen stream.
      
      // Create the stream for screen sharing.
      var screenStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true, // Set the audio attribute as false to avoid any echo during the call.
        video: false,
        screen: true, // screen stream
        screenAudio: true, // audio from the screen
        // extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg', // Google Chrome:
        mediaSource:  'screen', // Firefox: 'screen', 'application', 'window' (select one)
      });
      screenStream.setScreenProfile(screenVideoProfile); // set the profile of the screen
      screenStream.init(function(){
        AgoraRTC.Logger.info("getScreen successful");
        localScreen.stream = screenStream; // keep track of the screen stream

        localScreen.stream.stream.getVideoTracks()[0].onended = function() {
          window.AGORA_SCREENSHARE_UTILS.stopScreenShare(() => {
            window.AGORA_SCREENSHARE_UTILS.toggleScreenShareBtn();
            const loaderIcon = jQuery("#screen-share-btn").find('.spinner-border');
            const closeIcon = jQuery('#screen-share-icon');
            loaderIcon.hide();
            closeIcon.show();
          });
        }

        window.screenClient.publish(screenStream, function (err) {
          AgoraRTC.Logger.error("[ERROR] : publish screen stream error: " + err);
        });

        jQuery("#screen-share-btn").prop("disabled", false); // enable button
        cb(null, true);
      }, function (err) {
        AgoraRTC.Logger.error("[ERROR] : getScreen failed", err);
        localScreen.id = ""; // reset screen stream id
        localScreen.stream = {}; // reset the screen stream
        window.screenShareActive = false; // resest screenShare
        cb(err, null);
        // window.AGORA_SCREENSHARE_UTILS.toggleScreenShareBtn(); // toggle the button icon back (will appear disabled)
        if (err&& err.info) {
          alert('ScreenShare Error: ' + err.info);
        }
      });
    };
    var failedJoin = function(err) {
      AgoraRTC.Logger.error("[ERROR] : join channel as screen-share failed", err);
      cb(err, null);
    };

    window.AGORA_SCREENSHARE_UTILS.agora_generateAjaxToken(function(err, token) {
      if (err) {
        AgoraRTC.Logger.error("[TOKEN ERROR] : Get Token failed:", err);
        window.screenClient = null;
        cb(err, null);
        return false;
      }

      window.screenClient.join(token, window.channelName, userId, successJoin, failedJoin);

    }, userId);

    window.screenClient.on('stream-published', function (evt) {
      
      AgoraRTC.Logger.info("ScreenShare stream published successfully");
      

      const localCamera = window.RTC && window.RTC.localStreams ? RTC.localStreams.cam1 : localStreams.camera;

      if (window.isMainHost) {
        const video1 = jQuery('#local-video-cam1').find('video');
        if (video1[0].id !== 'video'+window.hostID) {
          // this mean that the central area is being used by some student camera
          const mainVideoEl = document.getElementById('player_' + window.hostID);
          
          const event = new MouseEvent('dblclick', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
          // TODO: No works this line because screenshare is alrady in progress :(
          mainVideoEl.parentElement.parentElement.dispatchEvent(event);

        }

        // localCamera.stream.muteVideo(); // disable the local video stream (will send a mute signal)
        localCamera.stream.stop(); // stop playing the local stream

        if (window.RTC.localStreams.cam2.id!=="") {
          window.RTC.localStreams.cam2.stream.stop();
          jQuery('#local-video-cam2').hide();
        }
        
        // play stream on the main container
        evt.stream.play('local-video-cam1');
      }
      
      // TODO: add logic to swap main video feed back from container
      /* if (typeof mainStreamId !== 'undefined') {
        remoteStreams[mainStreamId].stop(); // stop the main video stream playback
        
        if (window.AGORA_COMMUNICATION_CLIENT.addRemoteStreamMiniView) {
          window.AGORA_COMMUNICATION_CLIENT.addRemoteStreamMiniView(remoteStreams[mainStreamId]); // send the main video stream to a container
        }
      } */

      // localStreams.screen.stream.play('full-screen-video'); // play the screen share as full-screen-video (vortext effect?)
      jQuery("#video-btn").prop("disabled", true); // disable the video button (as cameara video stream is disabled)

      window.screenShareActive = true;
    });
    
    window.screenClient.on('stopScreenSharing', function (evt) {
      AgoraRTC.Logger.info("screen sharing stopped", err);
    });

  },

  stopScreenShare: function (cb) {
    const localScreen = window.RTC && window.RTC.localStreams ? RTC.localStreams.screen : window.localStreams.screen;
    const localCamera = window.RTC && window.RTC.localStreams ? RTC.localStreams.cam1 : localStreams.camera;

    // TODO: this should not be needed... but just in case.
    if (localScreen.id==="") {
      return false;
    }

    localScreen.stream.muteVideo(); // disable the local video stream (will send a mute signal)
    localScreen.stream.stop(); // stop playing the local stream
    localCamera.stream.enableVideo(); // enable the camera feed

    var videoContainer = window.agoraMode==='communication' ? 'local-video-cam1' : 'full-screen-video';
    localCamera.stream.play(videoContainer); // play the camera within the full-screen-video div
    jQuery("#video-btn").prop("disabled",false);

    if (window.isMainHost && window.RTC && window.RTC.localStreams && RTC.localStreams.cam2.stream.streamId) {
      RTC.localStreams.cam2.stream.play('local-video-cam2');
      jQuery('#local-video-cam2').show();
    }

    window.screenClient.leave(function() {
      window.screenShareActive = false; 
      AgoraRTC.Logger.info("screen client leaves channel");
      jQuery("#screen-share-btn").prop("disabled", false); // enable button
      window.screenClient.unpublish(localScreen.stream); // unpublish the screen client
      localScreen.stream.close(); // close the screen client stream
      localScreen.id = ""; // reset the screen id
      localScreen.stream = {}; // reset the stream obj
      cb && cb(null, true);
    }, function(err) {
      AgoraRTC.Logger.info("client leave failed ", err); //error handling
      cb(err, null);
    }); 
  },

  agora_generateAjaxToken: function (cb, uid) {
    var params = {
      action: 'generate_token', // wp ajax action
      cid: window.channelId,
      uid: uid || 0, // needed to generate a new uid
    };
    window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(data){
      if (data && data.token) {
        cb(null, data.token);
      } else {
        cb('Token not available', null);
      }
    }).fail(function(err){
      // console.error(err);
      if(err && err.error) {
        cb(err.error, null);
      } else {
        cb(err.toString(), null);
      }
    })
    
  }
}