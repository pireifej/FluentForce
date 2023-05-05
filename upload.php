<?php
header("content-type: application/javascript");

$target_dir = "";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"] . ".mp3");
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
  $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
  if($check !== false) {
    $arr['error'] = '0';
    $arr['message'] =  "File is an image - " . $check["mime"] . ".";
    echo json_encode($arr);
    $uploadOk = 1;
  } else {
    $arr['error'] = '1';
    $arr['message'] =  "File is not an image.";
    echo json_encode($arr);
    exit();
    $uploadOk = 0;
  }
}

// Check if file already exists
//if (file_exists($target_file)) {
//  $arr['error'] = '1';
//  $arr['message'] =  "Sorry, file already exists.";
//  echo json_encode($arr);
//  exit();
//  $uploadOk = 0;
//}

// Check file size
//if ($_FILES["fileToUpload"]["size"] > 500000) {
//  $arr['error'] = '1';
//  $arr['message'] = "Sorry, your file is too large.";
//  echo json_encode($arr);
//  exit();
//  $uploadOk = 0;
//}


 // Compress Image
//compressImage($_FILES['fileToUpload']['tmp_name'],$target_file,60);

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  $arr['error'] = '1';
  $arr['message'] = "Sorry, your file was not uploaded.";
  echo json_encode($arr);
  exit();
  // if everything is ok, try to upload file
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    $arr['error'] = '0';
  $arr['message'] = "The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). " has been uploaded.";
  echo json_encode($arr);
  exit();
  } else {
  $arr['error'] = '1';
  $arr['message'] = "Sorry, there was an error uploading your file.$target_file";
  echo json_encode($arr);
  exit();
  }
}

// Compress image
function compressImage($source, $destination, $quality) {

  $info = getimagesize($source);

  if ($info['mime'] == 'image/jpeg') 
    $image = imagecreatefromjpeg($source);

  elseif ($info['mime'] == 'image/gif') 
    $image = imagecreatefromgif($source);

  elseif ($info['mime'] == 'image/png') 
    $image = imagecreatefrompng($source);

  imagejpeg($image, $destination, $quality);
}
?>