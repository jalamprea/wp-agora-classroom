
/*
 * Event Listener on Double Click on remote streams (students divs).isMainHost
 *
 * Behavior: play selected container as full screen - swap out current full screen stream
 */
function swapVideoStudentAndHost() {

  if (!RTC.hostJoined && !window.isMainHost) {
    console.log('no host joined... action ignored');
    return;
  }

  const uid = this.id.replace('remote-container-', '');
  const videoPlayer = jQuery(this).find('video');
  let streamIdWithSuffix = videoPlayer[0].id.replace('video', '');
  
  const mainHostStream = window.isMainHost ? RTC.localStreams.cam1.stream : RTC.remoteStreams[window.hostID];
  const mainPlayerID = window.isMainHost ? 'local-video-cam1' : 'host-video-' + window.hostID;

  // if this container is playing a student video:
  if (streamIdWithSuffix.indexOf(uid)===0) {
    if (window.isMainHost) {
      let mainVideoId = document.getElementById(mainPlayerID).children[0].id;
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
      if (mainHostPlayer.parentElement.id===mainPlayerID) {
        swapStudentToTeacher(uid, streamIdWithSuffix);
      } else {
        mainVideoId = document.getElementById(mainPlayerID).children[0].id.replace('player_', '');
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

  // Restore main host to be on main player
  function swapMainHostToStudent(uid) {
    const streamIdWithSuffix = document.getElementById(mainPlayerID).children[0].id.replace('player_', '');
    const clickedStudentStream = RTC.studentsDouble[uid][streamIdWithSuffix];
    
    mainHostStream.stop();
    clickedStudentStream.stop();
    clickedStudentStream.play('agora_remote_' + uid);

    mainHostStream.play(mainPlayerID);

    if (window.isMainHost) {
      if (RTC.localStreams.cam2 && RTC.localStreams.cam2.stream && RTC.localStreams.cam2.stream.play) {
        RTC.localStreams.cam2.stream.play('local-video-cam2');
        document.getElementById('local-video-cam2').style.display = 'block';
      }
    } else {
      const idCam2 = window.hostID * (window.hostID + 123);
      if (RTC.remoteStreams[idCam2]) {
        RTC.remoteStreams[idCam2].play('host-video-'+idCam2);
        document.getElementById('host-video-'+idCam2).style.display = 'block';
      }
    }
  }

  // move student to the main player and main host video into the student div
  function swapStudentToTeacher(uid, streamIdWithSuffix) {

    const clickedStudentStream = RTC.studentsDouble[uid][streamIdWithSuffix];
    clickedStudentStream.stop();

    mainHostStream.stop();

    if (window.isMainHost) {
      if (RTC.localStreams.cam2 && RTC.localStreams.cam2.stream && RTC.localStreams.cam2.stream.stop) {
        RTC.localStreams.cam2.stream.stop();
        document.getElementById('local-video-cam2').style.display = 'none';
      }
    } else {
      const idCam2 = window.hostID * (window.hostID + 123);
      if (RTC.remoteStreams[idCam2]) {
        RTC.remoteStreams[idCam2].stop();
        document.getElementById('host-video-'+idCam2).style.display = 'none';
      }
    }

    // play remote student on the main host container
    clickedStudentStream.play(mainPlayerID);

    // play main host on the student box
    mainHostStream.play('agora_remote_'+uid);
  }

  // change main player from one student to another student
  function swapStudents(newUid, newStreamIdWithSuffix, currentUid, currentStreamId) {
    const clickedStudentStream = RTC.studentsDouble[newUid][newStreamIdWithSuffix];
    const currentMainStudentStream = RTC.studentsDouble[currentUid][currentStreamId];

    // stop new clicked student
    clickedStudentStream.stop();

    // stop current student (the one on the main player)
    currentMainStudentStream.stop();

    // stop mainHost
    mainHostStream.stop();

    // play new student on Main player
    clickedStudentStream.play(mainPlayerID);

    // play current student on the original div
    currentMainStudentStream.play('agora_remote_' + currentUid);

    // play mainHost on the new student div
    mainHostStream.play('agora_remote_' + newUid);
  }

}


// swap MainHost Cameras Layout
function swapMainHostCameras(evt) {
  const clickedDiv = this;
  let divToMinimize = null;

  if (clickedDiv.children[0].id.indexOf(window.UID_SUFFIX)>0) {
    console.log('invalid click on student div')
    return;
  }

  if (clickedDiv.style.position==='fixed') {
    // restore styles
    clickedDiv.style.position = null;
    clickedDiv.style.top = null;
    clickedDiv.style.left = null;
    clickedDiv.style.width = null;
    clickedDiv.style.height = null;
    clickedDiv.style.zIndex = null;
    return;
  }

  if (clickedDiv.id==='local-video-cam1') {
    divToMinimize = document.getElementById('local-video-cam2');
  } else {
    divToMinimize = document.getElementById('local-video-cam1');
  }

  // avoid double click on already maximized div
  if (divToMinimize.style.position==='fixed') {
    return;
  }

  let currentPos = document.getElementById('local-video-cam1').getBoundingClientRect();

  divToMinimize.style.position = 'fixed';
  divToMinimize.style.left = currentPos.left + 'px';
  divToMinimize.style.top = currentPos.top + 'px';
  divToMinimize.style.zIndex = 999;
  divToMinimize.style.width = '200px';
  divToMinimize.style.height = '120px';

  setTimeout(function(){
    currentPos = clickedDiv.getBoundingClientRect();
    divToMinimize.style.left = currentPos.left + 'px';
    divToMinimize.style.top = currentPos.top + 'px';
  }, 1);


}
// EOF
