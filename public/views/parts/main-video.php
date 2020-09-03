<div class="card px-0 ">
    <h4 class="card-header">
      <?php wp_title(); ?> /
      <?php echo $current_user->display_name; ?>
    </h4>
    <div id="main-video-container" class="videoContainer card-body form-row justify-content-center mx-0 d-flex align-items-center">
      <!-- main video goes here -->
      <?php
      $props = $channel->get_properties();
      // $props['appearance']['noHostImageURL']
      // $props['appearance']['splashImageURL']
      if ($props['appearance']['splashImageURL']!==""): ?>
      <img src="<?php echo $props['appearance']['splashImageURL'] ?>" alt="splash-image" id="splash-image" style="display: none">
      <?php endif; ?>

      <?php if ($props['appearance']['noHostImageURL']!==""): ?>
      <img src="<?php echo $props['appearance']['noHostImageURL'] ?>" alt="nohost-image" id="nohost-image" style="display: none">
      <?php endif; ?>

      <h2 id="non-logged-msg" style="display: none">
        <a href="/login">
          <?php _e('Log in to join this channel', 'agoraio'); ?>
        </a>
      </h2>
      <div id="rejoin-container" class="rejoin-container" style="display: none">
        <button id="rejoin-btn" class="btn btn-primary btn-lg" type="button">
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <?php _e('Rejoin this channel', 'agoraio'); ?>
        </button>
      </div>
    </div>
</div>