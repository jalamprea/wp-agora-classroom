<?php
// don't load directly
if ( ! defined( 'ABSPATH' ) ) {
  die( '-1' );
}
?>

<div class="wrap agoraio" id="agoraio-new-channel">
  <h1 class="wp-heading-inline">
    <?php
    if ( $post->initial() ) {
      echo esc_html( __( 'Add New Channel', 'agoraio' ) );
    } else {
      echo esc_html( __( 'Edit Channel', 'agoraio' ) );
    }
  ?></h1>
  <hr class="wp-header-end">

  <?php
  if ( $post ) :

    if ( current_user_can( 'edit_posts', $post_id ) ) {
      $disabled = '';
    } else {
      $disabled = ' disabled="disabled"';
    }
  ?>

  <form method="post" action="<?php echo esc_url( add_query_arg( array( 'post' => $post_id ), menu_page_url( 'agoraio', false ) ) ); ?>" id="agoraio-admin-form-element"<?php do_action( 'agoraio_post_edit_form_tag' ); ?>>
  <?php
    if ( current_user_can( 'edit_posts', $post_id ) ) {
      wp_nonce_field( 'agoraio-save-channel_' . $post_id );
    }
  ?>

  <input type="hidden" id="post_ID" name="post_ID" value="<?php echo (int) $post_id; ?>" />
  <input type="hidden" id="agoraio-locale" name="agoraio-locale" value="<?php echo esc_attr( $post->locale() ); ?>" />
  <input type="hidden" id="hiddenaction" name="action" value="save" />
  <input type="hidden" id="active-tab" name="active-tab" value="<?php echo isset( $_GET['active-tab'] ) ? (int) $_GET['active-tab'] : '0'; ?>" />


  <div id="poststuff">
    <div id="post-body" class="metabox-holder columns-1">
      <div id="post-body-content">
        <div id="titlediv">
          <div id="titlewrap">
            <label class="screen-reader-text" id="title-prompt-text" for="title">
              <?php echo __( 'Channel name', 'agoraio' ); ?>
            </label>
            <input
              type="text"
              name="post_title"
              size=30
              value="<?php echo $post->initial() ? '' : $post->title() ?>"
              id="title"
              spellcheck="true"
              autocomplete="off"
              placeholder="<?php echo __( 'Channel name', 'agoraio' ); ?>"
              required
              <?php echo current_user_can( 'edit_posts', $post_id ) ? '' : 'disabled="disabled"' ?>
            />
          </div><!-- #titlewrap -->
          <div class="inside">
          <?php if ( ! $post->initial() ) { ?>
            <p class="description">
            <label for="agora-shortcode"><?php echo esc_html( __( "Copy this shortcode and paste it into your post, page, or text widget content:", 'agoraio' ) ); ?></label>
            <span class="shortcode wp-ui-highlight">
              <input type="text" id="agora-shortcode" 
                onfocus="this.select();"
                readonly="readonly"
                class="large-text code"
                value="<?php echo esc_attr( $post->shortcode() ); ?>" />
            </span>
            </p>
          <?php } ?>
          </div>
        </div><!-- #titlediv -->
      </div><!-- #post-body-content -->

      <!--  metabox here  -->
      <div id="postbox-container-1" class="postbox-container">
        <?php do_action( 'agoraio_channel_form_settings', $post ); ?>
      </div>

      <div id="postbox-container-2" class="postbox-container">
        <?php do_action( 'agoraio_channel_form_appearance', $post ); ?>
      </div>

      <div id="postbox-container-3" class="postbox-container">
        <?php do_action( 'agoraio_channel_form_recording', $post ); ?>

        <p class="submit"><?php agoraio_admin_save_button( $post_id ); ?></p>
      </div>
    </div>
  </div>

  </form>
  <?php endif; ?>

</div><!-- end wrap -->


<?php

// Render the content of the metabox with Channel Settings
function render_agoraio_channel_form_settings($channel) {
  // echo "<pre>Settings:".print_r(, true)."</pre>";
  $props = $channel->get_properties();
  $type = $props['type'];
  $userHost = $props['host'];
  $settings = $props['settings'];
  ?>
  <ul class="nav nav-tabs">
    <li class="active">
      <a href="#tab-1" id="link-tab-1">
        <i class="dashicons-before dashicons-admin-plugins"> </i>
        <?php _e('Type and Permissions', 'agoraio') ?>
      </a>
    </li>
    <li><a href="#tab-2" id="link-tab-2">
      <i class="dashicons-before dashicons-share"> </i>
      <?php _e('Push to External Networks', 'agoraio') ?>
    </a></li>
    <li><a href="#tab-3" id="link-tab-3">
      <i class="dashicons-before dashicons-admin-settings"> </i>
      <?php _e('Inject External Streams', 'agoraio') ?>
    </a></li>
  </ul>
  <div class="tab-content">
    <div id="tab-1" class="tab-pane active">
      <?php if (!$type) { /* Set default type on new channels: */ $props['type'] = 'communication'; } ?>
      <table class="form-table">
        <?php
        $typeOptions = array(
          '' => __('Select Type', 'agoraio'),
          'broadcast' => __('Broadcast', 'agoraio'),
          'communication' => __('Communication', 'agoraio'),
        );
        agora_render_setting_row_select(
          'type',
          __('Channel type', 'agoraio'),
          $typeOptions,
          $props
        ) ?>
        <tr id="broadcast-host-row">
          <th scope="row"><label for="host"><?php _e('User Host', 'agoraio'); ?></label></th>
          <td>
            <?php
            $dropdownParams = array(
              "id" => "host",
              "name" => "host",
              "class" => "large-dropdown",
            );
            if (!empty($userHost)) {
              $dropdownParams['selected'] = $userHost;
            }
            wp_dropdown_users($dropdownParams);
            ?>
          </td>
        </tr>
      </table>
    </div>

    <div id="tab-2" class="tab-pane">
      <p class="desc"><?php _e("Agora.io supports publishing streams to CDN's CDN (Content Delivery Networks) using live transcoding . Transcoding sets the audio/video profiles and the picture-in-picture layout for the stream to be pushed to the CDN. Configure the live transcoding settings. <a href='https://docs.agora.io/en/Interactive%20Broadcast/cdn_streaming_android?platform=Android#introduction' target='_blank'>(more)</a>", 'agoraio'); ?></p>
      <hr/>
      <?php agora_render_video_settings($settings, 'external'); ?>
    </div>

    <div id="tab-3" class="tab-pane">
      <?php // echo "<pre>".print_r($settings, true)."</pre>"; ?>
      <p class="desc"><?php _e('Injecting external media streams refers to pulling an external audio or video stream to an ongoing Agora.io live broadcast channel, so that the hosts and audience in the channel can hear and see the stream while interacting with each other.', 'agoraio'); ?></p>
      <hr/>
      <?php agora_render_video_settings($settings, 'inject'); ?>
    </div>
  </div>
  <?php
}


function agora_render_video_settings($settings, $prefix) {
  ?>
  <table class="form-table">
    <?php
    agora_render_setting_row('width', __('Width', 'agoraio'), $settings, $prefix);
    agora_render_setting_row('height', __('Height', 'agoraio'), $settings, $prefix);
    agora_render_setting_row('videoBitrate', __('Video Bitrate', 'agoraio'), $settings, $prefix);
    agora_render_setting_row('videoFramerate', __('Video Framerate', 'agoraio'), $settings, $prefix);
    agora_render_setting_row('videoGop', __('Video GOP', 'agoraio'), $settings, $prefix);
    agora_render_setting_row_select(
      'lowLatency',
      __('Low Latency', 'agoraio'),
      array(
        'false' => __('High latency with assured quality (default)', 'agoraio'),
        'true' => __('Low latency with unassured quality', 'agoraio')
      ),
      $settings, $prefix
    );
    agora_render_setting_row_select(
      'audioSampleRate',
      __('Audio Sample Rate', 'agoraio'),
      array(
        44100 => __('44.1 kHz (default)', 'agoraio'),
        48000 => __('48 kHz', 'agoraio'),
        32000 => __('32 kHz', 'agoraio'),
      ),
      $settings, $prefix
    );
    agora_render_setting_row('audioBitrate', __('Audio Bitrate', 'agoraio'), $settings, $prefix);
    agora_render_setting_row_select(
      'audioChannels',
      __('Audio Channels', 'agoraio'),
      array(1 => __('Mono (default)', 'agoraio'), 2 => __('Dual sound channels', 'agoraio')),
      $settings, $prefix
    );
    agora_render_setting_row_select(
      'videoCodecProfile',
      __('Video Codec Profile', 'agoraio'),
      array(
        100 => __('High (default)', 'agoraio'),
        77 => __('Main', 'agoraio'),
        66 => __('Baseline', 'agoraio'),
      ),
      $settings, $prefix
    );
    ?>
    <tr>
      <th scope="row"><label for="backgroundColor"><?php _e('Background Color', 'agoraio') ?></label></th>
      <td>
        <input
          id="<?php echo $prefix.'-'; ?>backgroundColor"
          name="<?php echo $prefix.'-'; ?>backgroundColor"
          type="text"
          class="agora-color-picker"
          value="<?php echo $settings[$prefix.'-backgroundColor'] ?>"
          data-default-color="#ffffff">
      </td>
    </tr>
  </table>
  <?php
}

// Metabox content for Channel Appearance
function render_agoraio_channel_form_appearance($channel) {
  $props = $channel->get_properties();
  $appearance = $props['appearance'];
  ?>
  <table class="form-table">
    <?php
    agora_render_setting_row('splashImageURL', __('Splash Image URL', 'agoraio'), $appearance, '', 'url');
    agora_render_setting_row('noHostImageURL', __('No-host Image URL', 'agoraio'), $appearance, '', 'url');
    agora_render_setting_row('watchButtonText', __('Watch Stream Button Text', 'agoraio'), $appearance, '', 'text');
    agora_render_setting_row_select(
      'watchButtonIcon',
      __('Watch Stream icon', 'agoraio'),
      array(
        'true' => __('Show icon', 'agoraio'),
        'false' => __('Hide icon', 'agoraio')
      ), $appearance, '')
    ?>
    <tr id="activeButtonColorRow">
      <th scope="row"><label for="activeButtonColor"><?php _e('Active Button Color', 'agoraio') ?></label></th>
      <td>
        <input
          id="activeButtonColor"
          name="activeButtonColor"
          type="text"
          class="agora-color-picker"
          value="<?php echo $appearance['activeButtonColor'] ?>"
          data-default-color="#1E73BE">
      </td>
    </tr>
    <tr id="disabledButtonColorRow">
      <th scope="row"><label for="disabledButtonColor"><?php _e('Disabled Button Color', 'agoraio') ?></label></th>
      <td>
        <input
          id="disabledButtonColor"
          name="disabledButtonColor"
          type="text"
          class="agora-color-picker"
          value="<?php echo $appearance['disabledButtonColor'] ?>"
          data-default-color="#ffffff">
      </td>
    </tr>
  </table>
  <?php
}


function render_agoraio_channel_form_recording($channel) {
  $props = $channel->get_properties();
  $recording = $props['recording'];
  // die("<pre>".print_r($recording, true)."</pre>");
  ?>
  <table class="form-table">
    <?php
    agora_render_setting_row_select(
      'vendor',
      __('Vendor', 'agoraio'),
      array(
        '' => __('Select Cloud Vendor', 'agoraio'),
        0 => __('Qiniu Cloud', 'agoraio'),
        1 => __('Amazon S3', 'agoraio'),
        2 => __('Alibaba Cloud', 'agoraio')
      ), $recording, '');

    agora_render_setting_row_select(
      'region',
      __('Region', 'agoraio'),
      array('' => __('Please select a vendor', 'agoraio')), $recording, '');
    
    if(isset($recording['region'])) {
      echo '<input type="hidden" id="region-tmp" value="'.$recording['region'].'" />';
    }

    agora_render_setting_row('bucket', __('Bucket', 'agoraio'), $recording, '', 'text');

    agora_render_setting_row('accessKey', __('Access Key', 'agoraio'), $recording, '', 'text');

    agora_render_setting_row('secretKey', __('Secret Key', 'agoraio'), $recording, '', 'text');
    ?>
  </table>
  <script>
    // Cloud Recording Settings
    function agoraUpdateRegionOptions() {
      var vendor = parseInt(jQuery(this).val(), 10);
      var options = null;
      switch(vendor) {
        case 0: // china
          options = cloudRegions['qiniu'];
          break;
        case 1: // AWS
          options = cloudRegions['aws'];
          break;
        case 2: // Alibaba
          options = cloudRegions['alibaba'];
          break;
        default:
          break;
      }

      var region = jQuery('#region');
      region.empty();
      jQuery.each(options, function(key, value) {
        region.append(jQuery('<option/>').attr('value', key).text(value));
      });

      var tmpVal = jQuery('#region-tmp').val();
      if (tmpVal) {
        region.val( tmpVal );
      }
    }
    window.addEventListener('load', function() {
      jQuery('#vendor').change(agoraUpdateRegionOptions);
      jQuery('#vendor').change();
    });
  </script>
  <?php
}
?>