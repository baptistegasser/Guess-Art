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

## Strucutre du projet

Le projet est divisé en deux parties:

### Le client

Le client est une application NodeJS utilisant React.
Les sources se trouvent dans le dossier [client](./client).

### Le server

Le server est une application NodeJS utilisant Express.
Les sources se trouvent dans le dossier [server](./server).
