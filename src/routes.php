<?php
// Routes

require_once 'api/php/user.php';

$app->get('/', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("'/' route");

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->post('/api/login', function ($request, $response, $args) {
    $request_params = $request->getParsedBody();

    $username = $request_params["username"];
    $password = $request_params["password"];

    return $response->withJson(user_management::login($username, $password));
});

$app->post('/api/logout', function ($request, $response, $args) {
    $request_params = $request->getParsedBody();

    $token = $request_params["token"];

    return $response->withJson(user_management::logout($token));
});

$app->post('/register', function ($request, $response, $args) {
  //TODO : inscrire un nouvel utilisateur
});

$app->get('/publi', function($request, $response, $args) {
  //TODO : Obtenir la liste des publis
});

$app->get('/publi/{id}', function ($request, $response, $args) {
  //TODO : Obtenir le document lié à la publication
});

$app->get('/publi/{id}/infos', function ($request, $response, $args) {
  //TODO : Obternir les infos sur la publication
});

$app->post('/publi', function ($request, $response, $args) {
  //TODO : poster une publi
});

$app->put('/publi/{id}', function ($request, $response, $args) {
  //TODO : mettre à jour une publi
});

$app->delete('/publi/{id}', function ($request, $response, $args) {
  //TODO : supprimer une publi
});

$app->post('/recherche', function ($request, $response, $args) {
  //TODO : Obtenir la liste des publis suivant les critères de recherches transférer par le client dans un objet
  //Alternative : le faire entièrement côté client
});

$app->get('/compte', function ($request, $response, $args) {
  //TODO : Obtenir la liste des comptes
});

$app->get('/compte/{id}', function ($request, $response, $args) {
  //TODO : Visualiser un compte spécifique
});

$app->delete('/compte/{id}', function ($request, $response, $args) {
  //TODO : supprimer un compte
});

$app->get('/anomalies', function ($request, $response, $args) {
  //TODO : envoyer les anomalies
});

$app->get('/stats', function ($request, $response, $args) {
  //TODO : envoyer les stats
});

?>
