<?php


function agoraio_admin_save_button( $channel_id ) {
  static $button = '';

  if ( ! empty( $button ) ) {
    echo $button;
    return;
  }

  $nonce = wp_create_nonce( 'agoraio-save-channel_' . $channel_id );

  $onclick = sprintf(
      "this.form._wpnonce.value = '%s';"
    . " this.form.action.value = 'save';"
    . " return true;",
    $nonce );

  $button = sprintf(
    '<input type="submit" class="button-primary" name="agoraio-save" value="%1$s" onclick="%2$s" />',
    esc_attr( __( 'Save', 'agoraio' ) ),
    $onclick );

  echo $button;
}

// Render a Table Row with a Select component (dropdown) based on the settings passed as parameter)
function agora_render_setting_row_select($id, $title, $options, $settings, $prefix=null) {
  $input_id = !empty($prefix) ? $prefix.'-'.$id : $id;
  ?>
  <tr>
    <th scope="row"><label for="<?php echo $input_id ?>"><?php echo $title; ?></label></th>
    <td>
      <select id="<?php echo $input_id ?>" name="<?php echo $input_id ?>" required>
        <?php foreach ($options as $key => $value) {
          $selected = ($settings[$input_id]==$key) ? 'selected="selected"' : '';
          echo '<option value="'.$key.'" '.$selected.'>'.$value.'</option>';
        } ?>
      </select>
    </td>
  </tr>
  <?php
}

// Render a Table Row with a Input component (text or number) based on the settings passed as parameter)
function agora_render_setting_row($id, $title, $settings, $prefix, $inputType="number") {
  $input_id = !empty($prefix) ? $prefix.'-'.$id : $id;
  ?>
  <tr>
    <th scope="row"><label for="<?php echo $input_id ?>"><?php echo $title ?></label></th>
    <td>
      <input
        <?php echo $inputType!=='number' ? 'class="regular-text"' : 'min="0"'; ?>
        id="<?php echo $input_id ?>"
        name="<?php echo $input_id ?>"
        type="<?php echo $inputType ?>"
        value="<?php echo isset($settings[$input_id]) ? $settings[$input_id] : '' ?>">
    </td>
  </tr>
  <?php
}
