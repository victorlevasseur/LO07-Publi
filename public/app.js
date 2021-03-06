var app = angular.module('LO07-publi', ['ui.router', 'auth-module', 'admin-module', 'angular.filter',
            'naif.base64', 'publi-module', 'routes-module', 'tools-module']);

app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

app.controller('Home', [
    '$scope',
    '$state',
    'publi',
    function($scope, $state, publi){
        $scope.hasPublis = true;

        publi.getAll(function(response){
            if(response.success){
                $scope.publis = response.content;
                if(response.content.length === 0){
                    $scope.hasPublis = false;
                }
            } else {
                $scope.hasPublis = false;
                $scope.errors = response.error;
            }
        });
}]);

app.controller('NavBar', [
    '$scope',
    '$state',
    '$rootScope',
    'auth',
    function($scope, $state, $rootScope, auth){
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams, options){
            auth.currentUser(function(status){
                $scope.loggedIn = status.success;
                if(status.success){
                    $scope.username = status.username;
                    $rootScope.id = status.id;
                    $scope.isAdmin = (status.admin == 1);
                }else{
                    $scope.username = null;
                }
            });
        });

        $scope.goProfile = function(){
            $state.go('profile', {id: $rootScope.id});
        };

        $scope.goPublish = function(){
            $state.go('publish');
        };

        $scope.goHome = function(){
            $state.go('home');
        };

        $scope.login = function(){
            $state.go('login');
        };

        $scope.register = function(){
            $state.go('register');
        };

        $scope.logout = function(){
            auth.logout(function(status){
                $scope.loggedIn = !status.success;
                $scope.isAdmin = false;
                $state.go('home');
            });
        };

        $scope.goRecherche = function(){
            $state.go('recherche');
        };

        $scope.goAdmin = function(){
            $state.go('admin');
        };

        $scope.goAuteurs = function(){
            $state.go('auteurs');
        };
}]);

app.controller('Register', [
    '$scope',
    '$http',
    '$state',
    'auth',
    function($scope, $http, $state, auth){

        $scope.equipes = ["CREIDD", "ERA", "GAMMA3", "LASMIS", "LM2S", "LNIO", "LOSI", "Tech-CICO"];

        $scope.annuler = function(){
            $state.go("home");
        };

        $scope.register = function(){
            if(!$scope.user.prenom || !$scope.user.nom || !$scope.user.username || !$scope.user.password
                || !$scope.user.organisation || !$scope.user.equipe){
                $scope.errors = "Le formulaire d'inscription n'est pas complet !";
                return;
            }

            auth.register($scope.user, function(result){
                $scope.errors = status.error;
                if(result.success){
                    $state.go('home');
                }
            });
        };
}]);

app.controller('Login',[
    '$scope',
    '$http',
    '$state',
    'auth',
    function($scope, $http, $state, auth){

        $scope.login_info = {};

        $scope.annuler = function(){
            $state.go("home");
        };

        $scope.login = function(login_info){
            $scope.errors = "";

            if(!$scope.login_info.username || !$scope.login_info.password){
                $scope.errors = "Le formulaire de connexion n'est pas complet !";
                return;
            }

            auth.login($scope.login_info, function(result){
                $scope.errors = result.error;
                if(result.success){
                    $state.go('home');
                }
            });
        };
}]);

app.controller('Publish', [
    '$scope',
    '$state',
    '$http',
    '$rootScope',
    'publi',
    'auth',
    function($scope, $state, $http, $rootScope, publi, auth){
        $scope.statuts = ["Soumis", "En révision", "Publié"];
        $scope.categories = ['RI', 'CI', 'RF', 'CF', 'OS', 'TD', 'BV', 'AP'];
        $scope.publi = {};
        $scope.publi.auteurs = [];
        $scope.auteur = {};
        $scope.auteurs= [];
        $scope.journaux = [];
        $scope.conferences = [];

        publi.getAuteurs(function(status){
            if(status.success){
                $scope.auteurs = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        publi.getJournaux(function(status){
            if(status.success){
                $scope.journaux = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        publi.getConferences(function(status){
            if(status.success){
                $scope.conferences = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        $scope.associateAuteur = function(){
            for(var i = 0; i < $scope.auteurs.length; i++){
                if($scope.auteurs[i].nom == $scope.auteur.nom){
                    $scope.auteur.prenom = $scope.auteurs[i].prenom;
                    $scope.auteur.organisation = $scope.auteurs[i].organisation;
                    $scope.auteur.equipe = $scope.auteurs[i].equipe;
                    return;
                }
            }
        };

        $scope.associateJournal = function(){
            for(var i = 0; i < $scope.journaux.length; i++){
                if($scope.journaux[i].titre == $scope.publi.journal_titre){
                    $scope.publi.journal_editeur = $scope.journaux[i].editeur;
                }
            }
        };

        $scope.associateConf = function(){
            for(var i = 0; i < $scope.conferences.length; i++){
                if($scope.conferences[i].nom == $scope.publi.conference_nom){
                    $scope.publi.conference_lieu = $scope.conferences[i].lieu;
                    $scope.publi.conference_date = $scope.conferences[i].date_conference;
                }
            }
        };

        $scope.addAuteur = function(){
          $scope.publi.auteurs.push({
            prenom : $scope.auteur.prenom,
            nom : $scope.auteur.nom,
            organisation : $scope.auteur.organisation,
            equipe : $scope.auteur.equipe
          });
        };

        $scope.removeAuteur = function(index){
          $scope.publi.auteurs.splice(index, 1);
        };

        $scope.publish = function(){
            if($scope.publi.titre.length && $scope.publi.statut.length
                && $scope.publi.categorie.length && $scope.publi.annee_publication.toString().length){
                var publication = angular.copy( $scope.publi );

                if($scope.isAuteur){
                    publication.auteurs.push({ id: $rootScope.id} );
                }
                publi.post(publication, function(status){
                    if(status.success){
                        $state.go("publi", {id: status.id});
                    }
                    else{
                        $scope.errors = status.error;
                    }
                });
            }
        };
}]);

app.controller('Publi', [
    '$scope',
    '$stateParams',
    '$rootScope',
    '$state',
    '$window',
    'publi',
    'auth',
    function($scope, $stateParams, $rootScope, $state, $window, publi, auth){
        $scope.hasJournal = false;
        $scope.hasConference = false;
        $scope.isAuteur = false;

        $scope.download = function(){
            window.open("download/" + $scope.publi.id, '_blank');
        };

        publi.get($stateParams.id, function(response){
            if(response.success){
                $scope.publi = response.content;
                if(response.content.journal_titre != null){
                    $scope.hasJournal = true;
                }
                if(response.content.conference_nom != null){
                    $scope.hasConference = true;
                }
                for(var i=0; i<$scope.publi.auteurs.length; i++){
                    if($scope.publi.auteurs[i].id == $rootScope.id){
                        $scope.isAuteur = true;
                    }
                }
            }
            else {
                $scope.errors = response.error;
            }
        });

        auth.currentUser(function(response){
            if(response.success) {
                $scope.isAdmin = (response.admin == 1);
            }
            else {
                $scope.isAdmin = false;
            }
        });

        $scope.goUpdate = function(){
            $state.go('update', {id: $stateParams.id});
        };

        $scope.delete = function(){
            var confirmation = $window.confirm("Vous êtes sur le point de supprimer cette publication!");
            if(confirmation){
                publi.delete($stateParams.id, function(response){
                    if(response.success){
                        $state.go('home');
                    }
                    else {
                        $scope.errors = response.error;
                    }
                });
            }
        };
}]);

app.controller('Profile', [
    '$scope',
    '$state',
    '$stateParams',
    '$rootScope',
    'publi',
    'auth',
    function($scope, $state, $stateParams, $rootScope, publi, auth){
        $scope.hasPublis = false;
        $scope.coAuteurs = [];
        $scope.isSelf = ($rootScope.id == $stateParams.id);

        publi.getAuteur($stateParams.id, function(response){
            if(response.success){
                $scope.auteur = response.auteur[0];
                if(response.publis.length){
                    $scope.publis = response.publis;
                    $scope.hasPublis = true;

                    //Récupération des co-auteurs
                    for(var i = 0; i < $scope.publis.length; i++){
                        publi.get($scope.publis[i].id, function(response){
                            if(response.success){
                                for(var j = 0; j < response.content.auteurs.length; j++){
                                    if(response.content.auteurs[j].id != $stateParams.id){
                                        $scope.coAuteurs.push(response.content.auteurs[j]);
                                    }
                                }
                            } else {
                                $scope.errors = response.error;
                            }
                        });
                    }

                } else {
                    $scope.hasPublis = false;
                }
            }
            else if(response.message != "empty"){
                $scope.errors = response.error;
            }
        });

        $scope.countCoPublis = function(id){
            var result = 0;
            for(var i = 0; i<$scope.coAuteurs.length; i++){
                if($scope.coAuteurs[i].id == id){
                    result++
                }
            }
            return result;
        };

        $scope.delete = function(){
            auth.delete($stateParams.id, function(response){
                if(!response.success){
                    $scope.errors = response.error;
                } else {
                    $state.go('home');
                }
            });
        };
}]);

app.controller('Recherche', [
    '$scope',
    'publi',
    function($scope, publi){
        $scope.hasPublis = false;

        $scope.labs = ["CREIDD", "ERA", "GAMMA3", "LASMIS", "LM2S", "LNIO", "LOSI", "Tech-CICO"];

        $scope.search = function(){
            $scope.hasPublis = false;
            $scope.publis = {};

            publi.search($scope.params, function(response){
                if(response.success){
                    if(response.content.length){
                        $scope.hasPublis = true;
                        $scope.publis = response.content;
                    }
                    else{
                        $scope.hasPublis = false;
                    }
                }
                else{
                    $scope.hasPublis = false;
                    $scope.errors = status.error;
                }
            });
        };
}]);

app.controller('Update', [
    '$scope',
    '$stateParams',
    '$state',
    '$rootScope',
    'publi',
    function($scope, $stateParams, $state, $rootScope, publi){
        $scope.hasJournal = false;
        $scope.hasConference = false;
        $scope.isAuteur = false;

        $scope.statuts = ["Soumis", "En révision", "Publié"];
        $scope.categories = ['RI', 'CI', 'RF', 'CF', 'OS', 'TD', 'BV', 'AP'];
        $scope.publi = {};
        $scope.publi.auteurs = [];
        $scope.auteur = {};
        $scope.auteurs= [];
        $scope.journaux = [];
        $scope.conferences = [];

        publi.getAuteurs(function(status){
            if(status.success){
                $scope.auteurs = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        publi.getJournaux(function(status){
            if(status.success){
                $scope.journaux = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        publi.getConferences(function(status){
            if(status.success){
                $scope.conferences = status.content;
            } else if(status.message != "empty"){
                $scope.errors = status.error;
            }
        });

        $scope.associateAuteur = function(){
            for(var i = 0; i < $scope.auteurs.length; i++){
                if($scope.auteurs[i].nom == $scope.auteur.nom){
                    $scope.auteur.prenom = $scope.auteurs[i].prenom;
                    $scope.auteur.organisation = $scope.auteurs[i].organisation;
                    $scope.auteur.equipe = $scope.auteurs[i].equipe;
                    return;
                }
            }
        };

        $scope.associateJournal = function(){
            for(var i = 0; i < $scope.journaux.length; i++){
                if($scope.journaux[i].titre == $scope.publi.journal_titre){
                    $scope.publi.journal_editeur = $scope.journaux[i].editeur;
                }
            }
        };

        $scope.associateConf = function(){
            for(var i = 0; i < $scope.conferences.length; i++){
                if($scope.conferences[i].nom == $scope.publi.conference_nom){
                    $scope.publi.conference_lieu = $scope.conferences[i].lieu;
                    $scope.publi.conference_date = $scope.conferences[i].date_conference;
                }
            }
        };

        $scope.addAuteur = function(){
          $scope.publi.auteurs.push({
            prenom : $scope.auteur.prenom,
            nom : $scope.auteur.nom,
            organisation : $scope.auteur.organisation,
            equipe : $scope.auteur.equipe
          });
        };

        $scope.removeAuteur = function(index){
          $scope.publi.auteurs.splice(index, 1);
        };

        publi.get($stateParams.id, function(response){
            if(response.success){
                $scope.publi = response.content;
                if(response.content.journal_titre != null){
                    $scope.hasJournal = true;
                }
                if(response.content.conference_nom != null){
                    $scope.hasConference = true;
                }
                for(var i=0; i<$scope.publi.auteurs.length; i++){
                    if($scope.publi.auteurs[i].id == $rootScope.id){
                        $scope.isAuteur = true;
                    }
                }
            } else {
                $scope.errors = response.error;
            }
        });

        $scope.update = function(){
            if($scope.isSame){
                $scope.publi.fichier = "garder";
            }
            if($scope.form.inputFichier.$pristine){
                $scope.publi.fichier = null;
            }
            publi.put($stateParams.id, $scope.publi, function(response){
                if(response.success){
                    $state.go('publi', {id: response.id});
                } else {
                    $scope.errors = response.error;
                }
            });
        };
}]);

app.controller('Admin', [
    '$scope',
    '$state',
    '$window',
    'admin',
    'publi',
    'auth',
    function($scope, $state, $window, admin, publi, auth){
        admin.anomalies(function(response){
            if(response.success){
                $scope.doublons = response.doublons;
                $scope.publications = response.publications_non_utt;
            } else {
                $scope.errors = response.error;
            }
        });

        admin.stats(function(response){
            if(response.success){
                $scope.auteurs = response.auteurs;
                $scope.annees = response.annees;
            } else {
                $scope.errors = response.error;
            }
        });

        admin.comptes(function(response){
            if(response.success){
                $scope.utilisateurs = response.utilisateurs;
            } else {
                $scope.errors = response.error;
            }
        });

        $scope.delete = function(id){
            var confirmation = $window.confirm("Vous êtes sur le point de supprimer cette publication!");
            if(confirmation){
                publi.delete(id, function(response){
                    if(response.success){
                        $state.go($state.current, {}, {reload: true});
                    }
                    else {
                        $scope.errors = response.error;
                    }
                });
            }
        };

        $scope.deleteUser = function(id){
            var confirmation = $window.confirm("Vous êtes sur le point de supprimer cet utilisateur!")
            if(confirmation){
                auth.delete(id, function(response){
                    if(response.success){
                        $state.go($state.current, {}, {reload: true});
                    } else {
                        $scope.errors = response.error;
                    }
                });
            }
        };
}]);

app.controller('Auteurs', [
    '$scope',
    'publi',
    function($scope, publi){
        publi.getAuteurs(function(response){
            if(response.success){
                $scope.auteurs = response.content;
            } else {
                $scope.errors = response.error;
            }
        });
}]);
