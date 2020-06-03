/*
 * JS Interface for Agora.io SDK used into a classrooom environment
 */

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
  params: {}
};

async function initCameraLocalSettings() {
  const localDataRaw = window.localStorage.getItem('AGORA_DEVICES_ORDER');
  if ( localDataRaw ) {
    const localData = JSON.parse(localDataRaw);
    RTC.localStreams.cam1.device = window.availableCams.find(cam => cam.label===localData[0].label);
    RTC.localStreams.cam2.device = window.availableCams.find(cam => cam.label===localData[1].label);

    if (!RTC.localStreams.cam1.device || !RTC.localStreams.cam2.device) {
      window.localStorage.removeItem('AGORA_DEVICES_ORDER');
      initCameraLocalSettings();
    }
  } else {
    RTC.localStreams.cam1.device = window.availableCams[0];
    RTC.localStreams.cam2.device = window.availableCams[1];
    window.localStorage.setItem('AGORA_DEVICES_ORDER', JSON.stringify(window.availableCams));
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
window.AGORA_COMMUNICATION_CLIENT = {
  initClientAndJoinChannel: initClientAndJoinChannel,
  agoraJoinChannel: agoraJoinChannel,
  addRemoteStreamMiniView: addRemoteStreamMiniView,
  // agoraLeaveChannel: agoraLeaveChannel
};

async function initClientAndJoinChannel(agoraAppId, channelName) {
  // TODO: start to define Logger level
  // https://docs.agora.io/en/faq/API%20Reference/web/modules/agorartc.logger.html
  // AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.WARNING);

  // init Agora SDK per each client/cam
  const initCam = function(indexCam) {
    RTC.client[indexCam] = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});     
    RTC.client[indexCam].init(agoraAppId, function () {
      AgoraRTC.Logger.info("AgoraRTC client " + indexCam + " initialized");
      agoraJoinChannel(channelName, indexCam); // join channel upon successfull init
    }, function (err) {
      AgoraRTC.Logger.error("[ERROR] : AgoraRTC client " + indexCam + " init failed", err);
    });
  };

  const cams = await countCameras();
  if (cams>0) {
    console.log('=== Starting client 1')
    initCam("cam1");
  }

  if (cams>1 && window.isMainHost) {
    console.log('=== Starting client 2')
    initCam("cam2");
  }

  // Screenshare Client:
  RTC.client.screen = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});


  initAgoraEvents();
}

// join a channel
function agoraJoinChannel(channelName, indexCam) {
  // const token = window.AGORA_TOKEN_UTILS.agoraGenerateToken();

  const callback = function(err, token) {
    RTC.client[indexCam].join(token, channelName, userId, function(uid) {
      AgoraRTC.Logger.info("User " + uid + " join channel successfully");
      RTC.localStreams[indexCam].id = uid; // keep track of the stream uid 
      createCameraStream(uid, indexCam);
    }, function(errorJoin) {
        AgoraRTC.Logger.error("[ERROR] : join channel failed", errorJoin);
        /* if (err==='UID_CONFLICT') { } */
    });
  };
  let userId = window.userID || 0;
  if (indexCam==='cam2') {
    userId *= userId;
  }
  AGORA_SCREENSHARE_UTILS.agora_generateAjaxToken(callback, userId);

}

// video streams for channel
function createCameraStream(uid, indexCam) {
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
    document.getElementById('local-stream-container').appendChild(localVideoDiv);

    localStream.play('local-video-' + indexCam);

    // publish local stream
    RTC.client[indexCam].publish(localStream, function (err) {
      AgoraRTC.Logger.error("[ERROR] : publish local stream error: " + err);
    });
  
    indexCam==='cam1' && window.AGORA_COMMUNICATION_UI.enableUiControls(localStream); // move after testing
    RTC.localStreams[indexCam].stream = localStream; // keep track of the camera stream for later
    console.clear();
  }, function (err) {
    AgoraRTC.Logger.error("[ERROR] : getUserMedia failed", err);
  });
}


// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  
  console.log('Adding remote to miniview:', streamId);
  // append the remote stream template to #remote-streams
  const remoteStreamsDiv = jQuery('#remote-streams');
  let playerFound = false;
  if (remoteStreamsDiv.length>0) {
    playerFound = true;
    remoteStreamsDiv.append(
      jQuery('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container col'}).append(
        jQuery('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-microphone-slash'})
        ),
        jQuery('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
          jQuery('<i/>', {'class': 'fas fa-user'})
        ),
        jQuery('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
      )
    );
  } else {
    const avatarCircleDiv = jQuery('#uid-'+streamId);
    if (avatarCircleDiv.length>0) {
      playerFound = true;
      const circle = avatarCircleDiv.find('.avatar-circle');
      circle.append(
        jQuery('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container'}).append(
          jQuery('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-microphone-slash'})
          ),
          jQuery('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
            jQuery('<i/>', {'class': 'fas fa-user'})
          ),
          jQuery('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
        )
      )
      circle.find('img').hide();
    }
  }
  playerFound && remoteStream.play('agora_remote_' + streamId); 

  var containerId = '#' + streamId + '_container';
  jQuery(containerId).dblclick(function() {
    // play selected container as full screen - swap out current full screen stream
    RTC.remoteStreams[mainStreamId].stop(); // stop the main video stream playback
    addRemoteStreamMiniView(RTC.remoteStreams[mainStreamId]); // send the main video stream to a container
    const parentCircle = jQuery(containerId).parent();
    if (parentCircle.hasClass('avatar-circle')) {
      parentCircle.find('img').show();
    }
    jQuery(containerId).empty().remove(); // remove the stream's miniView container
    RTC.remoteStreams[streamId].stop() // stop the container's video stream playback
    RTC.remoteStreams[streamId].play('video-canvas'); // play the remote stream as the full screen video
    mainStreamId = streamId; // set the container stream id as the new main stream id
  });
}
window.mainStreamId = "";

/**
 **
 ** ========== Agora SDK Events ========== 
 **
 **/

function initAgoraEvents() {
  // when my local stream is published
  RTC.client.cam1.on('stream-published', function (evt) {
    console.info("Publish local stream successfully");
  });

  // connect remote streams
  RTC.client.cam1.on('stream-added', function (evt) {
    var stream = evt.stream;
    var streamId = stream.getId();
    AgoraRTC.Logger.info("new stream added: " + streamId);
    // Check if the stream is local
    // console.info('subscribe to remote stream:' + streamId);
    if (streamId != RTC.localStreams.screen.id && streamId!==RTC.localStreams.cam1.id && streamId!==RTC.localStreams.cam2.id) {
      // Subscribe to the remote stream
      RTC.client.cam1.subscribe(stream, function (err) {
        console.error("[ERROR] : subscribe stream failed", err);
      });
    }
  });

  // when Remote Stream is received:
  RTC.client.cam1.on('stream-subscribed', function (evt) {
    var remoteStream = evt.stream;
    var remoteId = remoteStream.getId();
    RTC.remoteStreams[remoteId] = remoteStream;
    // console.log('Stream subscribed:', remoteId);
    console.info('===> STREAM-SUBSCRIBED', remoteId)
    const callbackRemoteStreams = function() {
      console.info("Subscribe remote stream successfully: " + remoteId);

      if (!window.isMainHost) {
        if (window.hostID<100) {
          window.hostID += 100; // simple validation from the initial users in WP
        }

        if (remoteId===window.hostID || remoteId===(window.hostID*window.hostID)) {
          // in this case, this is one of the streams from the main host
        } else {
          // this stream is from another student.
        }
      } else {
        // I'm the host but i'm receiving streams from students
      }


      // Play stream on the main canvas
      console.log('PAINTING REMOTE:', remoteStream);
      if( jQuery('#video-canvas').is(':empty') ) { 
        mainStreamId = remoteId;
        remoteStream.play('video-canvas');
      } else {
        addRemoteStreamMiniView(remoteStream);
      }
    }
    
    const avatarsSlider = jQuery('#slick-avatars');
    if (avatarsSlider.length>0) {
      window.AGORA_UTILS.agora_getUserAvatar(remoteId, function(gravatar) {
        // console.log('callback gravatar:', gravatar);
        const url = gravatar.avatar.url;
        // const index = remoteId;
        const template = '<div id="uid-'+remoteId+'"><div class="avatar-circle"><img src="'+url+'" alt="gravatar" /></div></div>';
        jQuery('#slick-avatars').slick('slickAdd', template);

        callbackRemoteStreams();
      });
    } else {
      callbackRemoteStreams();
    }

  });

  RTC.client.cam1.on('stream-removed', function(evt) {
    console.info('REMOVED: ', evt.uid);
  })

  // remove the remote-container when a user leaves the channel
  RTC.client.cam1.on("peer-leave", function(evt) {
    if (!evt || !evt.stream) {
      console.error('Stream undefined cannot be removed', evt);
      return false;
    }
    console.log('peer-leave:', evt);
    var streamId = evt.stream.getId(); // the the stream id
    jQuery('#uid-'+streamId).remove();

    if (RTC.remoteStreams[streamId] !== undefined) {
      RTC.remoteStreams[streamId].stop(); // stop playing the feed
      delete RTC.remoteStreams[streamId]; // remove stream from list
      if (streamId == mainStreamId) {
        var streamIds = Object.keys(RTC.remoteStreams);
        var randomId = streamIds[Math.floor(Math.random()*streamIds.length)]; // select from the remaining streams
        if (RTC.remoteStreams[randomId]) {
          RTC.remoteStreams[randomId].stop(); // stop the stream's existing playback
          var remoteContainerID = '#' + randomId + '_container';
          jQuery(remoteContainerID).empty().remove(); // remove the stream's miniView container
          RTC.remoteStreams[randomId].play('video-canvas'); // play the random stream as the main stream
          mainStreamId = randomId; // set the new main remote stream
        }
      } else {
        var remoteContainerID = '#' + streamId + '_container';
        jQuery(remoteContainerID).empty().remove(); // 
      }
    }
  });

  // show mute icon whenever a remote has muted their mic
  RTC.client.cam1.on("mute-audio", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_mute', true);
  });

  RTC.client.cam1.on("unmute-audio", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_mute', false);
  });

  // show user icon whenever a remote has disabled their video
  RTC.client.cam1.on("mute-video", function (evt) {
    var remoteId = evt.uid;
    // if the main user stops their video select a random user from the list
    if (remoteId != mainStreamId) {
      // if not the main vidiel then show the user icon
      window.AGORA_UTILS.toggleVisibility('#' + remoteId + '_no-video', true);
    }
  });

  RTC.client.cam1.on("unmute-video", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_no-video', false);
  });  
}

