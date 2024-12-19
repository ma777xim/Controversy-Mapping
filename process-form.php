<?php

$email = $_POST["email"];
$username = $_POST["username"];
$password = $_POST["password"];

$host = "localhost";
$dbname = "mappers";
$username = "root";
$password = "";

$conn = mysqli_connect(hostname: $host,
                                            username: $username,
                                            password: $password,
                                            database: $dbname);

if (mysqli_connect_errno()) {
        die("Connection error:".mysqli_connect_error());
}

$sql = "INSERT INTO users (email, username, password)
        VALUES (?, ?, ?)";

$stmt = mysqli_stmt_init($conn);

if ( ! mysqli_stmt_prepare($stmt, $sql)) {
    die(mysqli_error($conn));
}

mysqli_stmt_bind_param($stmt, "sss",
                       $email,
                       $username,
                       $password);

mysqli_stmt_execute($stmt);

echo "Nice.";

?>