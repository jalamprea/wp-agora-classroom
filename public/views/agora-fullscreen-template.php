<?php 
$current_path       = plugins_url('wp-agora-io') . '/public';
$channelSettings    = $channel->get_properties();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <?php wp_head() ?>
</head>
<body <?php body_class(); ?>>

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

  <?php wp_footer(); ?>
  <?php require_once('parts/classroom-footer-scripts.php'); ?>
  
</body>
</html>