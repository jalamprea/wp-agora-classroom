<?php
$current_user       = wp_get_current_user();
$channelSettings    = $channel->get_properties();
?>
<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="agora-classroom">

  <!-- Bootstrap row -->
  <div class="row agora" id="body-row">
      <?php require_once('parts/sidebar.php'); ?>

      <!-- MAIN -->
      <div class="col d-block px-0">

        <?php require_once('parts/participants-list.php'); ?>
      
        <?php require_once('parts/main-video.php'); ?>
        
        <?php require_once('parts/students-video.php'); ?>
        

      </div><!-- Main Col END -->
      
  </div><!-- body-row END -->


  <?php require_once('parts/cam-settings.php'); ?>
  <?php require_once('parts/classroom-footer-scripts.php'); ?>
</div>