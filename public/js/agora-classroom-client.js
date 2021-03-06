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
  devices: {
    cameras: [],
    mics: []
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
  // addRemoteStreamMiniView: addRemoteStreamMiniView,
  agoraLeaveChannel: agoraLeaveChannel
};

window.HIGH_BITRATE = 0;
window.LOW_BITRATE = 1;

function initCameraLocalSettings() {
  const resetDefaultsCams = function() {
    console.log('Resseting Camera settings!');
    RTC.localStreams.cam1.device = window.availableCams[0];
    RTC.localStreams.cam2.device = window.availableCams[1];

    jQuery('#enableCam2').prop('checked', true);
    if (RTC.localStreams.cam2.device) {
      RTC.localStreams.cam2.device.enabled = true;
    }

    let micDevice = window.RTC.devices.mics.find(m => m.label.indexOf('Default')>=0);
    if (!micDevice) {
      micDevice = window.RTC.devices.mics[0];
    }
    
    const devicesArray = [...window.availableCams, micDevice];
    window.localStorage.setItem('AGORA_DEVICES_ORDER', JSON.stringify(devicesArray));
  };

  const localDataRaw = window.localStorage.getItem('AGORA_DEVICES_ORDER');
  if ( localDataRaw ) {
    let localData = JSON.parse(localDataRaw);
    console.log('Loading cam settings');

    RTC.localStreams.cam1.device = window.availableCams.find(cam => localData[0] && cam.label===localData[0].label);
    RTC.localStreams.cam2.device = window.availableCams.find(cam => localData[1] && cam.label===localData[1].label);
    RTC.localStreams.cam1.mic = window.RTC.devices.mics.find(m => localData[2] && m.label===localData[2].label);

    if (!RTC.localStreams.cam1.device || !RTC.localStreams.cam2.device || !RTC.localStreams.cam1.mic) {
      resetDefaultsCams();
      localData = JSON.parse(window.localStorage.getItem('AGORA_DEVICES_ORDER'));
    }

    if (localData.length===4) {
      RTC.localStreams.cam2.device.enabled = localData[3];
      jQuery('#enableCam2').prop('checked', localData[3]);
    } else {
      // load default values:
      if (RTC.localStreams.cam2.device) {
        jQuery('#enableCam2').prop('checked', true);
        RTC.localStreams.cam2.device.enabled = true;
      }
    }

    if (!RTC.localStreams.cam1.device || !RTC.localStreams.cam2.device) {
      window.localStorage.removeItem('AGORA_DEVICES_ORDER');
      initCameraLocalSettings();
      return;
    }
  } else {
    resetDefaultsCams()
  }

  jQuery('#list-camera1').val(RTC.localStreams.cam1.device.deviceId);
  RTC.localStreams.cam2.device && jQuery('#list-camera2').val(RTC.localStreams.cam2.device.deviceId);
  RTC.localStreams.cam1.mic && jQuery('#list-mic').val(RTC.localStreams.cam1.mic.deviceId);
}


async function getMicDevices(mics) {
  AgoraRTC.Logger.info("Checking for Mic window.devices.....")

  window.RTC.devices.mics = mics; // store mics array

  jQuery("#list-mic").empty();

  mics.forEach(function(mic, i) {
    let name = mic.label.split('(')[0];
    // const optionId = 'mic_' + i;
    if(name.split('Default - ')[1] != undefined) {
      name = '[Default Device]' // rename the default mic - only appears on Chrome & Opera
    }
    // jQuery('#mic-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
    jQuery("<option/>", {
      value: mic.deviceId,
      text: name,
    }).appendTo("#list-mic")
  });
}

window.availableCams = [];
async function countCameras() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices){
    try {
      var stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      var devices = await navigator.mediaDevices.enumerateDevices();
      // console.log('DEVICES:', devices)
      window.availableCams = devices.filter(device => device.kind === "videoinput");

      await getMicDevices( devices.filter(device => device.kind === "audioinput") );

      if (window.availableCams.length>0) {
        jQuery("#list-camera1").empty();
        jQuery("#list-camera2").empty();
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

// init Agora SDK per each client/cam
function initCam(indexCam, cb) {
  // debugger;
  RTC.client[indexCam] = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  
  RTC.client[indexCam].init(agoraAppId, function () {
    AgoraRTC.Logger.info("AgoraRTC client " + indexCam + " initialized");
    agoraJoinChannel(channelName, indexCam, cb); // join channel upon successfull init
  }, function (err) {
    AgoraRTC.Logger.error("[ERROR] : AgoraRTC client " + indexCam + " init failed", err);
  });
};

async function initClientAndJoinChannel(agoraAppId, channelName) {
  // https://docs.agora.io/en/faq/API%20Reference/web/modules/agorartc.logger.html
  AgoraRTC.Logger.enableLogUpload();
  AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.INFO);
  AgoraRTC.setParameter("JOIN_EXTEND", "{\"force_fir\":true}")

  
  // Check if the current user is logged in:
  if (window.userID!==0) {
    const countCams = await countCameras();
    if (countCams>0) {
      console.log('=== Starting client 1')
      initCam("cam1", function(err) {

        if (err) {
          console.log(err);
          alert('Error initializing cameras!');
          return;
        }

        if (!err && countCams>1 && window.isMainHost && RTC.localStreams.cam2.device.enabled) {
          console.log('=== Starting client 2');
          initCam("cam2");
        }
        
        // init UI Clicks and Listener
        window.AGORA_COMMUNICATION_UI.enableUiControls( RTC.localStreams.cam1.stream ); // move after testing 
      });

      // init agora events:
      initAgoraEvents();
    }


    // remove all elements that are not allowed for students
    if (!window.isMainHost) {
      jQuery('.only-main-host').remove();
    }

    // disable camera settings if I have only one camera
    // if (countCams===1) {
    //   jQuery('#cam-settings-btn').remove();
    // }

    // Screenshare Client:
    RTC.client.screen = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  } else {
    // TODO: show message for non-logged users
    jQuery('#non-logged-msg').show();
    jQuery('.only-main-host').remove();
  }

}

// join a channel
const isSafari = navigator.vendor.match(/[Aa]+pple/g);
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


      if (!isSafari) {
        RTC.client[indexCam].enableDualStream(
          ()=>{ console.log('DualStream [%s] OK', indexCam) },
          err => {console.error('Dual Stream failed', err)}
        );
      }
      createCameraStream(uid, indexCam, cb);

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
    }, function(errorJoin) {
        AgoraRTC.Logger.error("[ERROR] : join channel failed", errorJoin);
        cb(errorJoin, null)
    });

  };

  let userId = window.userID || 0;
  if (indexCam==='cam2') {
    userId *= (userId + 123);
  }

  if (!window.isMainHost) {
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
  } else {
    if (RTC.localStreams[indexCam].mic && RTC.localStreams[indexCam].mic.deviceId  && !navigator.userAgent.includes('Firefox')) {
      options.microphoneId = RTC.localStreams[indexCam].mic.deviceId;
    }
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

    if (window.isMainHost) {
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
    cb && cb(err);
  });
}


function agoraLeaveChannel() {
  
  if (screenShareActive) {
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

    // jQuery('#slick-avatars').slick('unslick').html('').slick(window.slickSettings);
    
    // show the modal overlay to join
    // jQuery("#modalForm").modal("show"); 
  }, function(err) {
    AgoraRTC.Logger.error("client leave failed ", err); //error handling
  });

  // second camera on main hosts:
  if (window.isMainHost) {
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

    if(!RTC.hostJoined && !window.isMainHost && streamId!==hostID) {
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
    console.log('Stream-subscribed', remoteId, RTC.remoteStreams);
    
    

    if (!RTC.remoteStreams[remoteId]) {
      RTC.remoteStreams[remoteId] = remoteStream;
      console.info('===> NEW STREAM-SUBSCRIBED', remoteId)
    } else {
      console.info('===> DUPLICATED STREAM-SUBSCRIBED', remoteId)
      // In this case: Stop the existing one and replace it with the new one
      RTC.remoteStreams[remoteId].stop();
      RTC.remoteStreams[remoteId] = remoteStream;
    }
    // console.log('Stream subscribed:', remoteId);
    
    let isStudent = false;
    if (remoteId !== remoteStream.getId() ) {
      if (!RTC.studentsDouble[remoteId]) {
        RTC.studentsDouble[remoteId] = {};
      } else {
        // if the student already exists.. I should paint a swithc video button in the student video.
        jQuery('#remote-container-' + remoteId).find('.switch-overlay').show();
      }
      RTC.studentsDouble[remoteId][ remoteStream.getId() ] = remoteStream;
      isStudent = true;
    } else {
      // this is a screenShare stream... I need to validate if it is a random uid
      isStudent = false;
    }

    if (!window.isMainHost) {

      // i'm student but receiving main host stream:
      if (remoteId===window.hostID || remoteId===(window.hostID * (window.hostID + 123))) {
        if (jQuery('#host-video-' + remoteId).length===0) {
          const hostVideoDiv = document.createElement('div');
          hostVideoDiv.id = 'host-video-' + remoteId;
          hostVideoDiv.classList.add('videoItem');
          document.getElementById('main-video-container').appendChild(hostVideoDiv);
          remoteStream.play('host-video-' + remoteId);

          document.getElementById('host-video-' + remoteId).removeEventListener('dblclick', toggleFullscreenDiv);
          document.getElementById('host-video-' + remoteId).addEventListener('dblclick', toggleFullscreenDiv);

          if( document.getElementById('host-screen-share')!==null ) {
            jQuery('#host-video-' + remoteId).hide();            
          }

        }
      } else {
        // this stream is from another student?
        // hostVideoDiv.classList.add('student-video');
        if (isStudent) {
          if (!isSafari) {
            RTC.client.cam1.setRemoteVideoStreamType(remoteStream, window.LOW_BITRATE)
          }

          addRemoteStreamMiniView(remoteStream);
        } else {

          const mainVideoEl = document.getElementById('player_' + window.hostID);
          if (mainVideoEl.parentElement.id!=='host-video-' + window.hostID) {
            // main video is not on the main screen... it should be restored.
            const event = new MouseEvent('dblclick', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
            // TODO: No works this line because screenshare is alrady in progress :(
            mainVideoEl.parentElement.parentElement.dispatchEvent(event);
          }

          // this is a screenShare stream, so we need stop/hide cameras and show the new stream
          

          // Stop current main host cameras:
          // RTC.remoteStreams[window.hostID].stop();
          jQuery('#host-video-' + window.hostID).hide();

          const id_cam2 = window.hostID * (window.hostID + 123);
          if (RTC.remoteStreams[id_cam2] && RTC.remoteStreams[id_cam2].stop) {
            RTC.remoteStreams[id_cam2].stop();
            jQuery('#host-video-'+id_cam2).hide();
          }

          const hostScreenDiv = document.createElement('div');
          hostScreenDiv.id = 'host-screen-share';
          hostScreenDiv.classList.add('videoItem');
          document.getElementById('main-video-container').appendChild(hostScreenDiv);
          
          // remoteStream.play('host-video-' + window.hostID);
          remoteStream.play('host-screen-share');
          window.screenShareActive = true;
        }
      }
    } else {

      if (!isSafari) {
        RTC.client.cam1.setRemoteVideoStreamType(remoteStream, LOW_BITRATE)
      }

      // I'm the host, so, i'm receiving streams from students
      addRemoteStreamMiniView(remoteStream);
    }


    if (isStudent || remoteId===window.hostID) {
      console.log('Getting remote avatar:', remoteId);
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

    if (!window.isMainHost) {
      const host_id_cam2 = window.hostID * (window.hostID + 123);
      if (streamId===window.hostID || streamId===host_id_cam2) {
        jQuery('#host-video-'+streamId).remove();

        if (streamId===window.hostID) {
          RTC.hostJoined = false;
          noHostImage.show();
        }
      } else {
        // if this is not an student stream... is a random screnshare uid:
        if (streamId === evt.stream.getId() ) {
          console.log('Stop screenshare...');
          RTC.remoteStreams[streamId].stop(); // stop playing the feed
          delete RTC.remoteStreams[streamId]; // remove stream from list
          jQuery('#host-screen-share').remove();
          jQuery('#host-video-' + window.hostID).show();

          RTC.remoteStreams[window.hostID].play('host-video-' + window.hostID);
          if (RTC.remoteStreams[host_id_cam2] && RTC.remoteStreams[host_id_cam2].play) {
            RTC.remoteStreams[host_id_cam2].play('host-video-' + host_id_cam2)
            jQuery('#host-video-' + host_id_cam2).show();
          }

          window.screenShareActive = false;
        }
      }
    }

    if (RTC.remoteStreams[streamId] !== undefined) {
      let removeStream = false;
      if (RTC.studentsDouble[streamId] && RTC.studentsDouble[streamId][evt.stream.getId()]) {
        delete RTC.studentsDouble[streamId][evt.stream.getId()];
        if (RTC.studentsDouble[streamId] && Object.keys(RTC.studentsDouble[streamId]).length===0) {
          delete RTC.studentsDouble[streamId];
        }
        const video = jQuery('#video'+evt.stream.getId());
        removeStream = video && video.length>0;
      }

      if (removeStream) {
        RTC.remoteStreams[streamId].stop(); // stop playing the feed
        delete RTC.remoteStreams[streamId]; // remove stream from list

        const remoteContainer = jQuery('#remote-container-'+streamId);
        const videoTag = remoteContainer.find('video');
        if (videoTag && videoTag.length>0 && videoTag[0].id !== 'video'+evt.stream.getId()) {
          const mainHostStream = window.isMainHost ? RTC.localStreams.cam1.stream : RTC.remoteStreams[window.hostID];
          mainHostStream.stop();

          const mainPlayerID = window.isMainHost ? 'local-video-cam1' : 'host-video-' + window.hostID;
          mainHostStream.play(mainPlayerID);

          if (window.isMainHost) {
            if (RTC.localStreams.cam2 && RTC.localStreams.cam2.stream) {
              document.getElementById('local-video-cam2').style.display = 'block';
              RTC.localStreams.cam2.stream.play('local-video-cam2');
            }
          } else {
            const idCam2 = window.hostID * (window.hostID + 123);
            if( RTC.remoteStreams[idCam2] ) {
              // enable again the second camera
              document.getElementById('host-video-'+idCam2).style.display = 'block';
              RTC.remoteStreams[idCam2].play('host-video-'+idCam2); 
            }
          }
        }
        remoteContainer.remove();

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

