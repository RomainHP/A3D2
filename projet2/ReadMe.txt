----------------------------------------------------------------------------------------------------------
---------------------------------Projet A3D - Master 2 Informatique---------------------------------------
------------------------------Par Romain CHARPENTIER et Etienne WEHOWSKI----------------------------------
----------------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------------
---	Liste des fichiers
----------------------------------------------------------------------------------------------------------

-	pathtracing.fs / pathtracing.vs : effectue le pathtracing dans une direction et ecrit dans une
texture

-	canvas.fs / canvas.vs : permet d'afficher la texture resultant du pathtracing


----------------------------------------------------------------------------------------------------------
---	Fonctionnalites
----------------------------------------------------------------------------------------------------------

Lorsque l'image reste stable, des rayons sont lances a chaque frame dans des directions aleatoires. Ainsi,
le calcul de la lumiere indirecte devient de plus en plus precis et donc l'image est moins bruitee. Donc,
lors d'un deplacement ou d'une rotation l'image se brouille, c'est normal.

- Deplacement de la camera : 
        Avec Z, Q, S, D
        En fonction de la rotation de la camera

- Rotation de la camera :
        Avec la souris, rester appuyer sur le clic gauche