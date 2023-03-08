// *** irep.js v1.0.0 2023-03-04 basé sur piezo_chroniques.js v1.1.0 *** 

// *** variables globales ***
	slong = 'longitude';
	slat = 'latitude';
	scode = 'codegidic';
	slib = 'nom';
	smeau = 'codeape'; 
	snbmes = 'nbans'; // nom du champ dans le fichier station pour le nb de données/mesures/analyses. Peut ne pas exister ('')
	sdatefin = 'anneefin';   // nom du champ dans le fichier station pour la date de fin. Permet de n'afficher que les stations qui dont des données postérieures à date passé en paramètre. Peut ne pas exister ('')
	sdatedeb = 'anneedeb';   // nom du champ dans le fichier station pour la date de fin. Permet de n'afficher que les stations qui dont des données postérieures à date passé en paramètre. Peut ne pas exister ('')
	snat = ''; // nom du champ dans le fichier station pour la nature (permet de discriminer l'affichage des stations par couleur ou présence/absence). Peut ne pas exister ('')
	sparam = ''; 
	sres = 'quantmax'; // nom du champ dans le fichier station pour le résultat max (permet de discriminer l'affichage des stations par seuil de résultat). Peut ne pas exister ('')
	sunit = ''; // nom du champ unité dans la réponse hubeau
	scodalt = 'idetab'; // 2023-03-05 nom du champ code alternatif qui relie aux données
	iconfile = 'pointMauve_on.png'; // l'image 'iconPiezo.svg' met trop de temps à charger quand beaucoup d'éléments et nécessiterait clustering
	iconscale = 15;
	icony = 0; // 32
	fdp = 'esri_topo3';
	fp1 = true; fp2 = true; fp3 = true; fp4 = false; fp5 = true; fp6 = true; fp7 = true;
	size = 40000; // 2022-08-02 changé de 20000 à 40000 car une station a 20304 mesures. Nécessité de changer le traitement dans donnees_piezo
	// tableaux pour rangeSelector de la fonction graphique()
	ty = ['year', 'year', 'year', 'year'];
	co = [3, 5, 10, 20];
	te = ['3 ans', '5 ans', '10 ans', '20 ans'];
	down_img_top = 278+30-75; // position de arrowdown pour gérer affichage graphique +30 pour possibilité station+nappe sur 3 lignes -75 suppression Contact
	ajout = 1000000000; // pour afficher 9 chiffres dans odometer
	station_layer_name = chemin + 'data/etab_CO2_num.json'; // nom du fichier des stations
	station_layer_type = 'json'; // json ou geojson
	setat = "établissements industriels"; // 2021-08-26 phrase qui doit apparaître dans la ligne d'état
// **************************

grandeur = "irep"; // pour éviter erreur dans les tooltips
seuil = 0;
station_layer(false); 
	
function donnees_piezo(bss) {
		
		var classdat = document.getElementById("dat");
		jsondata = new Array();
		processed_json = new Array();   
		id = feat.get('idetab');
		urlobs = chemin + 'data/emiss_CO2_transf.json';
		
		asyncReq(function(result) {
			var repobs = JSON.parse(result); 
			jsondata = repobs[id];
			//console.table(jsondata);
			if (typeof(jsondata) !== 'undefined') {
				//nbmes = jsondata.length; // ne fonctionne pas!
				//console.log("nbmes="+nbmes);
				nbmes = 0;
				for(var key in jsondata) {
					nbmes++;
					an = key;
					dat = Date.parse(an); // on garde une date en X pour être compatible avec les graphiques des autres démonstrateurs
					niv = jsondata[key]; 
					processed_json.push([dat, niv]);
				}
				processed_json.sort(function(a,b) { // ajout 2021-08-04 pour ne plus avoir le warning https://assets.highcharts.com/errors/15/ et avoir le navigator correct
					return a[0]-b[0]
				});
				dernier_resultat = processed_json[nbmes-1][1]; 
				if (dernier_resultat > 999999999) { dernier_resultat = 999999999; } // 2022-08-01 chiffre affiché quand dépassement (copié de prel.js)
				if (dernier_resultat < 0) { dernier_resultat = 0; } // 2021-08-25 pour prendre en compte piézos artésiens (copié de piezo_tr.js)
				delayedAlert(Math.round(dernier_resultat)); // // pas de chiffre après la virgule, plus de dernier chiffre en gris dans irep.htm
				classdat.innerHTML = "<b>"+ nbmes +"</b> mesures annuelles - Dernière année disponible : <b>" + an + "</b>";
				graphique("Emissions annuelles de CO2", 'Quantité (kg/an)', '%Y', -1, 'm', false, 3, 'column', false, false);
				document.getElementById("limit").style.display = 'none';

			} else {
				delayedAlert(0);
				classdat.innerHTML = "Pas de mesure disponible";
				graphique("Emissions annuelles de CO2", '', '%Y', -1, 'm', false, 3, 'column', false, false);
			}
			dm.style.cursor = "default";
			document.getElementById("search").style.cursor = "default";
		});		
}	

function init_nat() { // partie spécifique au démonstrateur pour le traitement des natures
}

function traitement_station() {
			dm.style.cursor = "wait";
			/*
			if (feat.get('ipt')) { // affichage de la bonne couleur du symbole dans le titre de la station
				switch (rep[feat.get('ipt')][snat].toLowerCase()) {
					case 'forage': scou = 'Or'; break;
					case 'source': scou = 'Bleu'; break;
					case 'puits': scou = 'Mauve'; break;
					case 'inconnue': scou = 'Gris'; break;
				}	
				document.getElementById('titre_detail').innerHTML = '<img src="images/point' + scou + '_on.png" title="' + rep[feat.get('ipt')][snat] + '">&nbsp;&nbsp;<b>Détail du point d\'eau</b> <i><class id="code"></class></i>'; 
			}	
			*/
			classbss.innerHTML = '<a href="https://www.georisques.gouv.fr/risques/installations/donnees/details/' + bss + '" target="_blank">Plus d\'informations sur l\'établissement</a>';
			document.getElementById("code").innerHTML = bss; 
			if (feat.get(slib)) {
				classlibpe.innerHTML = "<b>" + feat.get(slib);
			} else { classlibpe.innerHTML = "<b>" + bss; }	
			if (feat.get(smeau)) {
				snap = feat.get(smeau);
				if (snap.length > 80) { snap = snap.substring(0, 80) + '...'; }
				classlibpe.innerHTML += "</b> de code activité <b>" + snap;
			} else { classlibpe.innerHTML += "</b> de code activité non renseigné"; }
			donnees_piezo(bss);
}

function carte() {
	// paramètres génériques :  code_station (code AIOT), adresse, coord, fdp, size = profondeur des données (nb de données à afficher), nbobsmin (n'affiche que les stations qui ont au moins nbobsmin analyses), nature, datedeb, datefin, seuil
	// paramètres spécifiques : resdeb (date de début de la récupération des données et du tracé de la courbe)
	// pour le zoom : code_station est prioritaire sur coord qui est prioritaire sur adresse

	carte_commun();
	event_params();

}
/*
function affiche_legende() { // gérer les autres natures
	document.getElementById("legende").innerHTML = '<img class="imgleg" src="images/pointOr_' + sim[0] + 
		'.png" title="Forage" onclick="iconat(this)">&nbsp;&nbsp;Forage&nbsp;&nbsp;&nbsp;&nbsp;<img class="imgleg" src="images/pointBleu_' + 
		sim[1] + '.png" title="Source" onclick="iconat(this)">&nbsp;&nbsp;Source&nbsp;&nbsp;&nbsp;&nbsp;<img class="imgleg" src="images/pointMauve_' + 
		sim[2] + '.png" title="Puits" onclick="iconat(this)">&nbsp;&nbsp;Puits&nbsp;&nbsp;&nbsp;&nbsp;<img class="imgleg" src="images/pointGris_' + 
		sim[3] + '.png" title="Inconnue" onclick="iconat(this)">&nbsp;&nbsp;Inconnue&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
		'nbobsmin = <input type="text" id="val6" name="val6" size="6" title="Affichage uniquement des points d\'eau ayant au moins nbobsmin analyses" placeholder="nbobsmin" value="' + nbanamin + '">&nbsp;&nbsp;' + 
		'datedeb = <input type="text" id="val3" name="val3" size="8" title="Affichage uniquement des points d\'eau ayant des analyses antérieures à datedeb" placeholder="datedeb" value="' + datedeb + '">&nbsp;&nbsp;' +
		'datefin = <input type="text" id="val4" name="val4" size="8" title="Affichage uniquement des points d\'eau ayant des analyses postérieures à datefin" placeholder="datefin" value="' + datefin + '">';
}
*/
function infobulle(feat, j) { // contenu de l'infobulle, spécifique à chaque démonstrateur
	content.innerHTML = feat.get(scode) + ' - ' + feat.get(slib);
	n = rep[j][snbmes];
	if (n > 0) { 
		content.innerHTML += '<br>' + n + ' mesure';
		if (n > 1) { content.innerHTML += 's'; }
		content.innerHTML += ' de ' + rep[j][sdatedeb] + ' à ' + rep[j][sdatefin] + '<br>Quantité max : ' + new Intl.NumberFormat().format(rep[j][sres]) + ' kg/an';
	}
}
