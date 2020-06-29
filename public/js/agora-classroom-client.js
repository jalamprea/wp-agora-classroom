/*
 * JS Interface for Agora.io SDK used into a classrooom environment
 */
window.UID_SUFFIX = '0099';
window.RTC = {
  client: { cam1: null, cam2: null, screen: null },
  joined: false,
  published: false,
  localStreams: {
    cam1: {
      id: "",
      stream: {},
      device: null,
    },
    cam2: {
      id: "",
      stream: {},
      device: null,
    },
    screen: {
      id: "",
      stream: {}
    }
  },
  remoteStreams: {}, // remote streams obj struct [id : stream] 
  participants: {},
  hostJoined: false,
  studentsDouble: {} // object list with students who has double stream
};

window.screenShareActive = false;
window.AGORA_COMMUNICATION_CLIENT = {
  initClientAndJoinChannel: initClientAndJoinChannel,
  agoraJoinChannel: agoraJoinChannel,
  addRemoteStreamMiniView: addRemoteStreamMiniView,
  agoraLeaveChannel: agoraLeaveChannel
};

function initCameraLocalSettings() {
  const localDataRaw = window.localStorage.getItem('AGORA_DEVICES_ORDER');
  if ( localDataRaw ) {
    const localData = JSON.parse(localDataRaw);
    console.log('Loading cam settings');

    RTC.localStreams.cam1.device = window.availableCams.find(cam => cam.label===localData[0].label);
    RTC.localStreams.cam2.device = window.availableCams.find(cam => cam.label===localData[1].label);

    if (localData.length===3) {
      RTC.localStreams.cam2.device.enabled = localData[2];
      jQuery('#enableCam2').prop('checked', localData[2]);
    } else {
      // load default values:
      jQuery('#enableCam2').prop('checked', true);
      RTC.localStreams.cam2.device.enabled = true;
    }

    if (!RTC.localStreams.cam1.device || !RTC.localStreams.cam2.device) {
      window.localStorage.removeItem('AGORA_DEVICES_ORDER');
      initCameraLocalSettings();
    }
  } else {
    RTC.localStreams.cam1.device = window.availableCams[0];
    RTC.localStreams.cam2.device = window.availableCams[1];

    jQuery('#enableCam2').prop('checked', true);
    RTC.localStreams.cam2.device.enabled = true;
    
    window.localStorage.setItem('AGORA_DEVICES_ORDER', JSON.stringify(window.availableCams));
    console.log('Resseting Camera settings!');
  }

  jQuery('#list-camera1').val(RTC.localStreams.cam1.device.deviceId);
  jQuery('#list-camera2').val(RTC.localStreams.cam2.device.deviceId);
}


window.availableCams = [];
async function countCameras() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices){
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      const devices = await navigator.mediaDevices.enumerateDevices();
      window.availableCams = devices.filter(device => device.kind === "videoinput");

      if (isMainHost && window.availableCams.length>1) {
        window.availableCams.forEach(function (video) {
            jQuery("<option/>", {
              value: video.deviceId,
              text: video.label,
            }).appendTo("#list-camera1")
            jQuery("<option/>", {
              value: video.deviceId,
              text: video.label,
            }).appendTo("#list-camera2")
          });

        // read from localStorage or save the new settings:
        initCameraLocalSettings();
      } else {
        RTC.localStreams.cam1.device = window.availableCams[0];
      }


      return window.availableCams.length;
    } catch(ex) {
      console.error('Error on camera detection:', ex);
    }
  }

  return 0;
}


async function initClientAndJoinChannel(agoraAppId, channelName) {
  // https://docs.agora.io/en/faq/API%20Reference/web/modules/agorartc.logger.html
  AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.WARNING);

  // init Agora SDK per each client/cam
  const initCam = function(indexCam, cb) {
    RTC.client[indexCam] = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
    RTC.client[indexCam].init(agoraAppId, function () {
      AgoraRTC.Logger.info("AgoraRTC client " + indexCam + " initialized");
      agoraJoinChannel(channelName, indexCam, cb); // join channel upon successfull init
    }, function (err) {
      AgoraRTC.Logger.error("[ERROR] : AgoraRTC client " + indexCam + " init failed", err);
    });
  };

  // Check if the current user is logged in:
  if (window.userID!==0) {
    const cams = await countCameras();
    if (cams>0) {
      console.log('=== Starting client 1')
      initCam("cam1", function() {

        if (cams>1 && window.isMainHost && RTC.localStreams.cam2.device.enabled) {
          console.log('=== Starting client 2');
          initCam("cam2");
        }
        
        // init UI Clicks and Listener
        window.AGORA_COMMUNICATION_UI.enableUiControls( RTC.localStreams.cam1.stream ); // move after testing 
      });

      // init agora events:
      initAgoraEvents();
    }

    if (!isMainHost) {
      window.AGORA_UTILS.toggleVisibility('#cam-settings-btn', isMainHost);
    }

    // Screenshare Client:
    RTC.client.screen = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  } else {
    // TODO: show message for non-logged users
    jQuery('#non-logged-msg').show();
    jQuery('#cam-settings-btn').remove();
  }

}

// join a channel
function agoraJoinChannel(channelName, indexCam, cb) {
  // const token = window.AGORA_TOKEN_UTILS.agoraGenerateToken();

  const callbackWithToken = function(err, token) {
    if (err) {
      console.error('Token Error:', err);
      // alert('Your access token could not be generated. This page will be reloaded!');
      window.location.reload(true);

      // const rejoinBtn =jQuery('#rejoin-btn');
      // if (rejoinBtn.prop('disabled')) {
      //   rejoinBtn.prop('disabled', false);
      //   rejoinBtn.find('.spinner-border').hide();
      // }
      // return;
    }

    RTC.client[indexCam].join(token, channelName, userId, function(uid) {
      AgoraRTC.Logger.info("User " + uid + " join channel successfully");
      // console.info("User " + uid + " join channel successfully");
      RTC.localStreams[indexCam].id = window.userID; // keep track of the stream uid 
      createCameraStream(uid, indexCam, cb);
    }, function(errorJoin) {
        AgoraRTC.Logger.error("[ERROR] : join channel failed", errorJoin);
        /* if (err==='UID_CONFLICT') { } */
    });

    if (indexCam==='cam1') {
      
      window.AGORA_UTILS.agora_getUserAvatar(window.userID, function(gravatar) {
        // console.log('callbackWithToken gravatar:', gravatar);
        const url = gravatar.avatar.url;
        RTC.participants[window.userID] = {
          url: url,
          user: gravatar.user
        }
        AGORA_COMMUNICATION_UI.updateParticipants();
      });
    }
  };

  let userId = window.userID || 0;
  if (indexCam==='cam2') {
    userId *= (userId + 123);
  }

  if (!isMainHost) {
    const n = Math.floor(Math.random() * 10);
    userId = parseInt(String(userId) + n + UID_SUFFIX);
  }
  AGORA_SCREENSHARE_UTILS.agora_generateAjaxToken(callbackWithToken, userId);

}

// video streams for channel
function createCameraStream(uid, indexCam, cb) {
  const options = {
    streamID: uid,
    audio: true,
    video: true,
    screen: false,
    cameraId: RTC.localStreams[indexCam].device.deviceId
  };
  if (indexCam!=='cam1') {
    options.audio = false;
  }
  const localStream = AgoraRTC.createStream(options);
  localStream.setVideoProfile(window.cameraVideoProfile);
  localStream.init(function() {
    if (indexCam==='cam1') {
      jQuery('#rejoin-container').hide();
      jQuery('#buttons-container').removeClass('hidden');

      var thisBtn = jQuery('#rejoin-btn');
      thisBtn.prop("disabled", false);
      thisBtn.find('.spinner-border').hide();
    }

    AgoraRTC.Logger.info("local getUserMedia successfully");

    // TODO: add check for other streams. play local stream full size if alone in channel

    // localStream.play('local-video'); // play the given stream within the local-video div
    const localVideoDiv = document.createElement('div');
    localVideoDiv.id = 'local-video-' + indexCam;

    if (isMainHost) {
      localVideoDiv.classList.add('videoItem');
      document.getElementById('main-video-container').appendChild(localVideoDiv);
    } else {
      localVideoDiv.classList.add('student-video');
      document.getElementById('remote-streams').appendChild(localVideoDiv);
    }

    localStream.play('local-video-' + indexCam);

    // publish local stream
    RTC.client[indexCam].publish(localStream, function (err) {
      AgoraRTC.Logger.error("[ERROR] : publish local stream error: " + err);
    });
  
    RTC.localStreams[indexCam].stream = localStream; // keep track of the camera stream for later

    // on agora-classroom-ui swap cameras layout:
    jQuery('#'+localVideoDiv.id).dblclick(swapMainHostCameras);
    
    // Execute callback after finish this function
    cb && cb();
  }, function (err) {
    AgoraRTC.Logger.error("[ERROR] : getUserMedia failed", err);
  });
}


function agoraLeaveChannel() {
  
  if(screenShareActive) {
    window.AGORA_SCREENSHARE_UTILS.stopScreenShare();
  }

  RTC.client.cam1.leave(function() {
    AgoraRTC.Logger.info("client leaves channel");
    RTC.localStreams.cam1.stream.stop() // stop the camera stream playback
    RTC.client.cam1.unpublish(RTC.localStreams.cam1.stream); // unpublish the camera stream
    RTC.localStreams.cam1.stream.close(); // clean up and close the camera stream
    
    // Force GC (?)
    RTC.remoteStreams = null;
    RTC.remoteStreams = {};

    jQuery("#remote-streams").empty() // clean up the remote feeds
    jQuery('#main-video-container').find('.videoItem').remove();
    jQuery('#nohost-image').hide();
    jQuery('#splash-image').hide();
    
    //disable the UI elements
    jQuery("#mic-btn").prop("disabled", true);
    jQuery("#video-btn").prop("disabled", true);
    jQuery("#screen-share-btn").prop("disabled", true);
    jQuery("#exit-btn").prop("disabled", true);
    jQuery('#local-video-cam1').remove();
    // hide the mute/no-video overlays
    window.AGORA_UTILS.toggleVisibility("#mute-overlay", false); 
    window.AGORA_UTILS.toggleVisibility("#no-local-video", false);

    jQuery('#rejoin-container').show();
    jQuery('#buttons-container').addClass('hidden');

    jQuery('#slick-avatars').slick('unslick').html('').slick(window.slickSettings);
    
    // show the modal overlay to join
    // jQuery("#modalForm").modal("show"); 
  }, function(err) {
    AgoraRTC.Logger.error("client leave failed ", err); //error handling
  });

  // second camera on main hosts:
  if (isMainHost) {
    RTC.client.cam2 && RTC.client.cam2.leave(() => {
      RTC.localStreams.cam2.stream.stop() // stop the camera stream playback
      RTC.client.cam2.unpublish(RTC.localStreams.cam2.stream); // unpublish the camera stream
      RTC.localStreams.cam2.stream.close(); // clean up and close the camera stream
      jQuery('#local-video-cam2').remove();
      AgoraRTC.Logger.info("client2 leaves channel");
    }, err => {
      AgoraRTC.Logger.error("Client2 leave failed ", err); //error handling
    });
  }
}


// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  let streamId = remoteStream.getId();
  if (String(streamId).indexOf(window.UID_SUFFIX)>0) {
      streamId = String(streamId).substring(0, String(streamId).length - 5); // remove UID_SUFFIX and Random integer
      streamId = parseInt(streamId);
    }
  
  console.log('Adding remote to miniview:', streamId);
  // append the remote stream template to #remote-streams
  const remoteStreamsDiv = jQuery('#remote-streams');
  let playerAvailable = false;
  if (remoteStreamsDiv.length>0 && remoteStreamsDiv.find('#remote-container-'+streamId).length===0) {
    playerAvailable = true;
    remoteStreamsDiv.append(
      jQuery('<div/>', {'id': 'remote-container-'+streamId,  'class': 'remote-stream-container student-video'}).append(
        jQuery('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-microphone-slash'})
        ),
        jQuery('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
          jQuery('<i/>', {'class': 'fas fa-user'})
        ),
        jQuery('<div/>', {'id': streamId + '_switch', 'class': 'switch-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-sync'})
        ),
        jQuery('<div/>', {'id': streamId + '_username', 'class': 'username-overlay'}),
        jQuery('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
      )
    );

    jQuery('#'+streamId+'_switch').click(function(evt){
      evt.preventDefault();
      
      const uid = this.id.replace('_switch', '');
      const parentPlayer = jQuery(this.parentElement).find('#agora_remote_'+uid);
      const currentVideoId = parentPlayer[0].children[0].id.replace('player_', '');
      // console.log('Real UID:', currentVideoId);
      // console.log('change cam for user:', uid);
      const nextStream = Object.values(RTC.studentsDouble[uid]).find(s => s.streamId!=currentVideoId);
      RTC.studentsDouble[uid][currentVideoId].stop();
      nextStream.play('agora_remote_' + uid);
    });
  }
  playerAvailable && remoteStream.play('agora_remote_' + streamId); 

  var containerId = '#' + 'remote-container-' + streamId;
  jQuery(containerId).dblclick(swapVideoStudentAndHost);
}

/**
 **
 ** ========== Agora SDK Events ========== 
 **
 **/
function initAgoraEvents() {
  console.log('Starting events...', hostID, userID);
  const noHostImage = jQuery('#nohost-image');

  if (hostID!==userID) {
    noHostImage.show();
  }
  
  // when my local stream is published
  RTC.client.cam1.on('stream-published', function (evt) {
    console.info("Publish local stream successfully", evt);
  });

  // connect remote streams
  RTC.client.cam1.on('stream-added', function (evt) {
    const stream = evt.stream;
    let streamId = window.AGORA_UTILS.getRealUserId( stream.getId() );

    console.log("new stream added: " + streamId);

    if (!RTC.hostJoined && streamId===hostID) {
      RTC.hostJoined = true;
      noHostImage.hide();
    }

    if(!RTC.hostJoined && !isMainHost && streamId!==hostID) {
      noHostImage.show();
    }

    // Check if the stream is local
    // console.info('subscribe to remote stream:' + streamId);
    if (streamId != RTC.localStreams.screen.id && streamId!==RTC.localStreams.cam1.id && streamId!==(RTC.localStreams.cam1.id*(RTC.localStreams.cam1.id + 123))) {
      // Subscribe to the remote stream
      RTC.client.cam1.subscribe(stream, function (err) {
        AgoraRTC.Logger.error("[ERROR] : subscribe stream failed", err);
      });
    }
  });

  // when Remote Stream is received:
  RTC.client.cam1.on('stream-subscribed', function (evt) {
    const remoteStream = evt.stream;
    let remoteId = window.AGORA_UTILS.getRealUserId( remoteStream.getId() );
    console.log('Stream-subscribed', remoteId);
    

    if (remoteId !== remoteStream.getId() ) {
      if (!RTC.studentsDouble[remoteId]) {
        RTC.studentsDouble[remoteId] = {};
      } else {
        // if the student already exists.. I should paint a swithc video button in the student video.
        jQuery('#remote-container-' + remoteId).find('.switch-overlay').show();
      }
      RTC.studentsDouble[remoteId][ remoteStream.getId() ] = remoteStream;
    }

    if (!RTC.remoteStreams[remoteId]) {
      RTC.remoteStreams[remoteId] = remoteStream;
      console.info('===> NEW STREAM-SUBSCRIBED', remoteId)
    } else {
      console.info('===> DUPLICATED STREAM-SUBSCRIBED', remoteId)
    }
    // console.log('Stream subscribed:', remoteId);


    if (!window.isMainHost) {

      // i'm student but receiving main host stream:
      if (remoteId===window.hostID || remoteId===(window.hostID * (window.hostID + 123))) {
        if (jQuery('#host-video-' + remoteId).length===0) {
          const hostVideoDiv = document.createElement('div');
          hostVideoDiv.id = 'host-video-' + remoteId;
          hostVideoDiv.classList.add('videoItem');
          document.getElementById('main-video-container').appendChild(hostVideoDiv);
          remoteStream.play('host-video-' + remoteId);
        }
      } else {
        // this stream is from another student.
        // hostVideoDiv.classList.add('student-video');
        addRemoteStreamMiniView(remoteStream);
      }
    } else {
      // I'm the host, so, i'm receiving streams from students
      addRemoteStreamMiniView(remoteStream);
    }


    // Play stream on the main canvas
    console.log('PAINTING REMOTE:', remoteId);

    // avoid render the second host camera:
    if(remoteId!==(window.hostID * (window.hostID + 123))) {
      window.AGORA_UTILS.agora_getUserAvatar(remoteId, function(gravatar) {
        // console.log('callback gravatar:', gravatar);
        const url = gravatar.avatar.url;
        RTC.participants[remoteId] = {
          url: url,
          user: gravatar.user
        };
        jQuery('#'+remoteId+'_username').html(gravatar.user.display_name);
        AGORA_COMMUNICATION_UI.updateParticipants();
      });
    }

  });

  RTC.client.cam1.on('stream-removed', function(evt) {
    console.info('REMOVED: ', evt.uid);
  })

  // remove the remote-container when a user leaves the channel
  RTC.client.cam1.on("peer-leave", function(evt) {
    if (!evt || !evt.stream) {
      AgoraRTC.Logger.error('Stream undefined cannot be removed', evt);
      return false;
    }
    console.log('peer-leave:', evt);
    let streamId = window.AGORA_UTILS.getRealUserId(evt.stream.getId());

    if (!isMainHost) {
      if (streamId===window.hostID || streamId===(window.hostID * (window.hostID + 123))) {
        jQuery('#host-video-'+streamId).remove();
        RTC.hostJoined = false;
        noHostImage.show();
      }
    }

    if (RTC.remoteStreams[streamId] !== undefined) {
      let removeStream = false;
      if (RTC.studentsDouble[streamId] && RTC.studentsDouble[streamId][evt.stream.getId()]) {
        delete RTC.studentsDouble[streamId][evt.stream.getId()];
        const video = jQuery('#video'+evt.stream.getId());
        removeStream = video && video.length>0;
      }

      if (removeStream) {
        RTC.remoteStreams[streamId].stop(); // stop playing the feed
        delete RTC.remoteStreams[streamId]; // remove stream from list
        jQuery('#remote-container-'+streamId).remove();

        // also remove it form the participants list
        RTC.participants[streamId] = null;
        delete RTC.participants[streamId];
        window.AGORA_COMMUNICATION_UI.updateParticipants();
      } else {
        jQuery('#remote-container-'+streamId).find('.switch-overlay').hide();
      }
    }
  });

  // show mute icon whenever a remote has muted their mic
  RTC.client.cam1.on("mute-audio", function (evt) {
    const streamId = window.AGORA_UTILS.getRealUserId( evt.uid );
    window.AGORA_UTILS.toggleVisibility('#' + streamId + '_mute', true);
  });

  RTC.client.cam1.on("unmute-audio", function (evt) {
    const streamId = window.AGORA_UTILS.getRealUserId( evt.uid );
    window.AGORA_UTILS.toggleVisibility('#' + streamId + '_mute', false);
  });

  // show user icon whenever a remote has disabled their video
  RTC.client.cam1.on("mute-video", function (evt) {
    const remoteId = window.AGORA_UTILS.getRealUserId( evt.uid );

    // if not the main vidiel then show the user icon
    window.AGORA_UTILS.toggleVisibility('#' + remoteId + '_no-video', true);
  });

  RTC.client.cam1.on("unmute-video", function (evt) {
    const remoteId = window.AGORA_UTILS.getRealUserId( evt.uid );
    window.AGORA_UTILS.toggleVisibility('#' + remoteId + '_no-video', false);
  });  
}

