----------------------------------------------------------------------------------------------------------
---------------------------------Projet A3D - Master 2 Informatique---------------------------------------
------------------------------Par Romain CHARPENTIER et Etienne WEHOWSKI----------------------------------
----------------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------------
---	Liste des fichiers
----------------------------------------------------------------------------------------------------------

-	main.html : contient le code html de la page
-	callback.js : contient les fonctions gerant la fenetre
-	glCourseBasis.js : parametre des shaders et envoi au GPU, gestion des animations et des differentes options...
-	utils.js	: fonctions utilitaires utilisees dans glCourseBasis
-	plane.vs / plane.fs : shader pour le plateau
-	balls.vs / balls.fs : shader pour les boules
-	light.vs	/ light.fs : shader pour la boule symbolisant la source de lumiere (couleur toujours en jaune)


----------------------------------------------------------------------------------------------------------
---	Fonctionnalites
----------------------------------------------------------------------------------------------------------

Pour chaque boule, sa position, couleur et sigma est calculee aleatoirement.

- Gestion du zoom : 
		Avec la molette de la souris
		Permet de deplacer la camera selon l'axe Y
		Bouton reset pour le replacer a l'emplacement par defaut
		
- Deplacement d'une boule :
		"Shift + Clique Gauche" puis deplacer dans une direction la souris et relacher
		Permet de deplacer la boule 1 dans une direction donnee
		
- Deplacement de la source de lumiere :
		"Ctrl + Clique Gauche" puis deplacer dans une direction la souris et relacher
		Permet de deplacer la source de lumiere dans une direction donnee
		Bouton reset pour le replacer a l'emplacement par defaut
		
- Stopper / Relancer les animations : 
		Appuyer sur le bouton "Play" ou "Stop"
		
- Activer / Desactiver les animations en fonction de l'inclinaison du plateau :
		Appuyer sur le bouton "Play animation rotation" ou "Stop animation rotation"
		
- Changer le nombre de boules :
		Glisser sur le slider au dessus du texte "Nombre de billes".
		
- Changer la couleur de la lumiere :
		Cliquer sur le bouton de couleur, choisir une couleur puis valider
		
- Choisir une BRDF :
		Cliquer sur un des boutons radios

- Changer les parametres de BRDF :
		Glisser sur les sliders
		Permet de modifier les parametres donnes pour Cook-Torrance
		Ks est le coefficient applique a Cook-Torrance avant de l'ajouter a Lambert
		
