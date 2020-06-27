
function swapVideoStudentAndHost() {
  // play selected container as full screen - swap out current full screen stream
  // console.log('Double click!');

  if (!RTC.hostJoined && !window.isMainHost) {
    console.log('no host joined... action ignored');
    return;
  }

  const uid = this.id.replace('remote-container-', '');
  const videoPlayer = jQuery(this).find('video');
  let streamIdWithSuffix = videoPlayer[0].id.replace('video', '');
  // console.log(streamIdWithSuffix);

  // if this container is playing a student video:
  if (streamIdWithSuffix.indexOf(uid)===0) {
    if (window.isMainHost) {
      let mainVideoId = document.getElementById('local-video-cam1').children[0].id;
      if (mainVideoId==='player_' + window.hostID) {
        swapStudentToTeacher(uid, streamIdWithSuffix);
      } else {
        mainVideoId = mainVideoId.replace('player_', '');
        const currentUid = window.AGORA_UTILS.getRealUserId(mainVideoId);
        swapStudents(uid, streamIdWithSuffix, currentUid, mainVideoId);
        window.AGORA_UTILS.toggleVisibility('#'+currentUid+'_username', true);
      }
    } else {
      const mainHostPlayer = document.getElementById('player_' + window.hostID);
      if (mainHostPlayer.parentElement.id==='host-video-' + window.hostID) {
        swapStudentToTeacher(uid, streamIdWithSuffix);
      } else {
        mainVideoId = document.getElementById('host-video-' + window.hostID).children[0].id.replace('player_', '');
        const currentUid = window.AGORA_UTILS.getRealUserId(mainVideoId);
        swapStudents(uid, streamIdWithSuffix, currentUid, mainVideoId);
        window.AGORA_UTILS.toggleVisibility('#'+currentUid+'_username', true);
      }
    }
    window.AGORA_UTILS.toggleVisibility('#'+uid+'_username', false);

  } else { // if this action is to restore the main host video:

    swapMainHostToStudent(uid);

    // disable .username-overlay
    window.AGORA_UTILS.toggleVisibility('#'+uid+'_username', true);
  }
}

// Restore main host to be on main player
function swapMainHostToStudent(uid) {
  const mainHostStream = window.isMainHost ? RTC.localStreams.cam1.stream : RTC.remoteStreams[window.hostID];
  const mainPlayerID = window.isMainHost ? 'local-video-cam1' : 'host-video-'+window.hostID;
  const streamIdWithSuffix = document.getElementById(mainPlayerID).children[0].id.replace('player_', '');
  
  mainHostStream.stop();
  RTC.studentsDouble[uid][streamIdWithSuffix].stop();
  RTC.studentsDouble[uid][streamIdWithSuffix].play('agora_remote_' + uid);

  mainHostStream.play(mainPlayerID);

  if (window.isMainHost) {
    if (RTC.localStreams.cam2 && RTC.localStreams.cam2.stream && RTC.localStreams.cam2.stream.play) {
      RTC.localStreams.cam2.stream.play('local-video-cam2');
      jQuery('#local-video-cam2').show();
    }
  } else {
    const idCam2 = window.hostID * (window.hostID + 123);
    if (RTC.remoteStreams[idCam2]) {
      RTC.remoteStreams[idCam2].play('host-video-'+idCam2);
      jQuery('#host-video-'+idCam2).show();
    }
  }
}

// move student to the main player and mian host video into the student div
function swapStudentToTeacher(uid, streamIdWithSuffix) {

  const clickedStudentStream = RTC.studentsDouble[uid][streamIdWithSuffix];
  clickedStudentStream.stop();

  if (window.isMainHost) {
    RTC.localStreams.cam1.stream.stop();
    if (RTC.localStreams.cam2 && RTC.localStreams.cam2.stream && RTC.localStreams.cam2.stream.stop) {
      RTC.localStreams.cam2.stream.stop();
      jQuery('#local-video-cam2').hide();
    }

    // play remote student on the main host container
    clickedStudentStream.play('local-video-cam1');

    // play main host on the student box
    RTC.localStreams.cam1.stream.play('agora_remote_'+uid);
  } else {
    // streamId===window.hostID || streamId===(window.hostID * (window.hostID + 123))
    if (RTC.remoteStreams[window.hostID]) {
      RTC.remoteStreams[window.hostID].stop();
      const idCam2 = window.hostID * (window.hostID + 123);
      if (RTC.remoteStreams[idCam2]) {
        RTC.remoteStreams[idCam2].stop();
        jQuery('#host-video-'+idCam2).hide();
      }

      clickedStudentStream.play('host-video-'+window.hostID);
      RTC.remoteStreams[window.hostID].play('agora_remote_'+uid);
    }
  }
}


function swapStudents(newUid, newStreamIdWithSuffix, currentUid, currentStreamId) {
  // console.log(newUid, newStreamIdWithSuffix);
  // console.log(currentUid, currentStreamId);
  const clickedStudentStream = RTC.studentsDouble[newUid][newStreamIdWithSuffix];
  const currentMainStudentStream = RTC.studentsDouble[currentUid][currentStreamId];

  // stop new clicked student
  clickedStudentStream.stop();

  // stop current student (the one on the main player)
  currentMainStudentStream.stop();

  // stop mainHost
  const mainHostStream = window.isMainHost ? RTC.localStreams.cam1.stream : RTC.remoteStreams[window.hostID];
  mainHostStream.stop();

  // play new student on Main player
  window.isMainHost ? clickedStudentStream.play('local-video-cam1') : clickedStudentStream.play('host-video-'+window.hostID);

  // play current student on the original div
  currentMainStudentStream.play('agora_remote_' + currentUid);

  // play mainHost on the new student div
  mainHostStream.play('agora_remote_' + newUid);
}

// EOF
