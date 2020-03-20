# Guess'Art

## Description

Guess’Art est un jeu multijoueur dont le but est de deviner un mot mystère dessiné par un des joueurs.

Une manche se déroule de la manière suivante:
un joueur est tiré au hasard afin d’être le dessinateur; Il va devoir choisir parmis une sélection de mots celui qu’il souhaite dessiner.
Le dessinateur a à sa disposition différents types d’outils, pinceaux et couleurs afin d’avoir une assez grande liberté de dessin.

Les autres joueurs ont pour but de deviner le mot mystère qui est dessiné sur le tableau, pour cela ils disposent d’un chat où ils peuvent écrire leurs propositions.
Ce chat sert également de lieu de discussion entre les joueurs ce qui implique également qu’il est possible de voir les suggestions de ses adversaires.

Afin de rendre le jeu dynamique, un compte à rebours est mis en place une fois le mot choisis par le dessinateur. À la fin de ce compte à rebours, la manche s’arrête, le mot mystère est révélé et les scores calculés.
Le score d’un joueur est augmenté de X points par manche selon les règles suivantes:
pour un joueur qui devine : plus il devine rapidement le mot, plus il gagnera de points en fin de la manche.
pour le joueur qui dessine : il gagnera une quantité de points proportionnelle au nombre de joueurs ayant trouvé le mot, afin de récompenser son talent ; cependant, le dessinateur gagnera toujours moins de point qu’une personne qui devine.

Le jeu contient plusieurs fonctionnalités supplémentaires :
la possibilité de rejoindre soit par son identifiant unique ou bien de manière aléatoire.
la possibilité de lancer un vote pour expulser une personne qui serait absente, antijeu (écriture du mot au lieu du dessin) ou bien qui tiendrait de propos inappropriés.

## Configuration

Le projet support la modification de certain paramètres via des variablesenvironnements chargées depuis un fichier `.env`.
Le fichier `.env.example` liste les variables environnements attendus.

Ainsi pour utilis le projet il faudras copier le fichier exemple en un fichier `.env` puis éditer les variables comme on le désire.

## Dévelopement

Pour lancer l'application durant le developement il faudra mettre la variable environnement `ENV` à toute autre valeur autre que "production", par exemple "dev".
On utilisera ensuite les commande suivantes:

1. `npm run start` pour lancer le serveur React pour la partie Front-End.
2. `npm run server` pour lancer le serveur Express qui gère l'API et la communication client/serveur.

## Mise en production

Pour mettre l'application en production il faut:

1. Build l'application React avec `npm run build`;
2. Créer un fichier `.env` avec les identifiants adaptés vers la BD ainsi que la variable `ENV` fixé à "production".
