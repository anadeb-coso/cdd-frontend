export const DONATIONS = [
    {
        value: 'Aucun',
        label: 'Aucun'
    },
    {
        value: 'Niveau chef village',
        label: 'Niveau chef village'
    },
    {
        value: 'Niveau chef canton',
        label: 'Niveau chef canton'
    },
    {
        value: 'Niveau Maire',
        label: 'Niveau Maire'
    },
    {
        value: 'Niveau Juge',
        label: 'Niveau Juge'
    },
    {
        value: 'N/A (Ancien site)',
        label: 'N/A (Ancien site)'
    }
]


export const TYPES_OF_SUB_PROJECT_COLOR = {
    'Bibliothèques scolaires': '#808080', //Gray f-Gris
    'Blocs de latrines dans les établissements scolaires': '#808080', //Gray f-Gris
    'Bâtiment Scolaire au CEG': '#808080', //Gray f-Gris
    'Bâtiment Scolaire au Lycée': '#808080', //Gray f-Gris
    'Bâtiment Scolaire au Primaire': '#808080', //Gray f-Gris
    'Bâtiment Scolaire au Pré-scolaire': '#808080', //Gray f-Gris
    'CMS': '#008200', //Green f-vert
    "Cantine d'Hôpital": "#008200", //Green f-vert
    'Centre Communautaire': "#ffa500", //Orange f-orange
    'Clôture (Centre de santé)': "#ffa500", //Orange f-orange
    'Clôture (Ecole)': '#808080', //Gray f-Gris
    "Dalot d'accès à l'école": '#808080', //Gray f-Gris
    'Electrification hors réseau avec lampadaires solaires': "#9c9c14", //DarkYellow f-jaune sombre
    'Extension réseau électrique': "#939301", //Olive f-Olive
    'Forage Photovoltaïque (Boisson)': '#0000ff', //Blue f-blue
    'Forage Photovoltaïque (Centre communautaire)': '#0000ff',  //Blue f-blue
    'Forage Photovoltaïque (Ecole)': '#0000ff',  //Blue f-blue
    'Forage Photovoltaïque (Maison des jeunes)': '#0000ff',  //Blue f-blue
    'Forage Photovoltaïque (Maraichage)': '#0000ff',  //Blue f-blue
    'Forage Photovoltaïque (Salle de réunion)': '#0000ff',  //Blue f-blue
    'Incinérateurs médicaux': "#008200", //Green f-vert
    'Laboratoire': "#00ff00", //Lime f-citron vert
    'Latrine Communautaire': "#191970", //MidNightBlue f-Blue sombre
    'Magasin de Stockage': "#800080", //Purple f-Violet
    'Maison des jeunes': "#ff0000", //Red f-rouge
    'Paillote enseignants': '#808080', //Gray f-Gris
    'Paillote pour centre de santé': "#008200", //Green f-vert
    'Pharmacie': "#006400", //Darkgreen f-vert sombre
    'Pistes': "#000000", //Black f-noire
    'Pédiatrie': "#92d492", //DarkSeaGreen f-Vert de mer foncé
    'Reboisement': "#deb887", //Burlywood f-Bois massif
    "Retenue d'eau": '#601ee0', //Blueviolet f-Blue violet
    'Réhabilitation PMH': '#1e90ff', //DodgerBlue f-Bleu cagnard
    'Réhabilitation PMH en Forage Photovoltaïque (Ecole)': '#1e90ff', //DodgerBlue f-Bleu cagnard
    'Salle de réunion': "#a75e06", //DarkOrange f-Orange sombre
    'Terrain de Foot': "#7a1212", //DarkRed f-rouge sombre
    'USP': "#3b7024", //DarkOliveGreen f-Vert olive foncé
}


export const PHASES_COLORS = [
    '#D9D9D9', // 0
    '#63D3AC', // 1
    '#F0788E', // 2
    '#F2CD86', // 3
    '#9095FF', // 4
    '#44967D', // 5
    '#BA79B7', // 6
    '#E9B9C2', // 7
]

export const PHASES_WITH_THEIR_NUMBERS = {
    "VISITES PREALABLES": 1,
    "MOBILISATION COMMUNAUTAIRE": 2,
    "PLANIFICATION": 3,
    "PRÉPARATION SOUS-PROJET": 4,
    "CONSULTATION  ET EXAMEN SOUS-PROJET": 5,
    "MISE EN ŒUVRE DU SOUS-PROJET": 6,
    "CLOTURE ET REPLANIFICATION DU SOUS-PROJET": 7,
}

export const VALIDATION_PROCESS_COLORS = [
    '#F2CD86', // Pending to validate : Yellow 0
    '#63D3AC', // Validated : Light Green 1
    '#F0788E', // Invalidated : Red 2
    '#397F6A', // Completed :  Dark Green 3
    '#E9B9C2', // Undo :  Light Red 4
    '#5D0B22', // Deadline passed :  Dark Red 5
    'black', // Vacation :  Black 6
]

export const TYPES_VACATION = [
    "Congé annuel", "Maternité/Paternité", "Maladie", "Permission exceptionnelle : décés",
    "Permission exceptionnelle : mariage", "Permission exceptionnelle : naissance",
    "Autre"
  ]

export const COMPONENTS = [
    "COMPOSANTE 1.1",
    "COMPOSANTE 1.2", 
    "COMPOSANTE 1.2a", 
    "COMPOSANTE 1.2b",
    "COMPOSANTE 1.3", 
    "COMPOSANTE 2",
    "COMPOSANTE 3",
    "COMPOSANTE 4",
    "COMPOSANTE 5",
    "Autre"
]


export const FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS = [
    "PV", "DOCUMENT", "DOCUMENTS", "FICHIER", "FICHIERS", "LISTE", "LISTES", "PLAN", "PLANS", "LETTRE", "LETTRES",
    "FICHE", "FICHES", "CERTIFICATION", "CERTIFICATIONS", "RAPPORT", "RAPPORTS", "CERTIFICAT", "AUTORISATION", "NOTIFICATION",
    "DÉCHARGE", "ACCUSÉE", "AVIS", "PASSATION", "INVITATION", "ARCHITECTURES", "ARCHITECTURE", "PAYMENT", "REÇUS"
]

export const WORK_ENVIRONMENT = [
    {
        value: 'Office',
        label: 'Bureau'
    },
    {
        value: 'Field',
        label: 'Terrain'
    },
    {
        value: 'Hotel/Workshop',
        label: 'Hôtel/Atelier'
    },
    {
        value: 'Remote',
        label: 'Distance'
    },
    {
        value: 'Overseas assignment',
        label: 'Mission hors du pays'
    },
    {
        value: 'Other',
        label: 'Autre'
    }
]



// Ranking of the different status of the structure
export const IDENTIFIED_RANKING = 1;
export const NOT_APPROVED_BY_CORA_RANKING = 2;
export const APPROVED_BY_CORA_RANKING = 3;
export const DAO_LAUNCHED_RANKING = 4;
export const SELECTED_COMPANY_RANKING = 5;
export const FIRST_CONTRACT_RANKING = 6;
export const CONTRACT_TERMINATED_RANKING = 6.1;
export const DAO_RELAUNCHED_RANKING = 6.2;
export const OTHERS_CONTRACT_RANKING = 6.3;
export const SITE_DISCOUNT_RANKING = 7;
export const ANOTHER_SITE_HANDED_OVER_FOR_CONSTRUCTION_RANKING = 7.1;
export const IN_PROGRESS_RANKING = 8;
export const ABANDONED_RANKING = 9;
export const INTERRUPTED_RANKING = 10;
export const RESUME_IN_PROGRESS_RANKING = 10.1;
export const COMPLETED_RANKING = 11;
export const RECEPTION_TECHNICAL_RANKING = 12;
export const PROVISIONAL_RECEPTION_RANKING = 13;
export const HANDOVER_TO_COMMUNITY_RANKING = 14;
export const FINAL_RECEPTION_RANKING = 15;

export const IDENTIFIED_RANKING_LIST = [IDENTIFIED_RANKING];
export const STRUCTURE_IN_PROGRESS_RANKING_LIST = [IN_PROGRESS_RANKING, RESUME_IN_PROGRESS_RANKING];
export const STRUCTURE_COMPLETED_RANKING_LIST = [COMPLETED_RANKING, RECEPTION_TECHNICAL_RANKING, PROVISIONAL_RECEPTION_RANKING, FINAL_RECEPTION_RANKING];
export const PROBLEMS_STEPS_RANKING_LIST = [NOT_APPROVED_BY_CORA_RANKING, DAO_RELAUNCHED_RANKING, CONTRACT_TERMINATED_RANKING, ABANDONED_RANKING, INTERRUPTED_RANKING];
export const DAO_LAUNCHED_RANKING_LIST = [DAO_LAUNCHED_RANKING, DAO_RELAUNCHED_RANKING];
export const CONTRACT_RANKING_LIST = [FIRST_CONTRACT_RANKING, OTHERS_CONTRACT_RANKING];

// Grouping of the different status of the structure
export const STRUCTURE_NOT_START_STATUS = ['Identifié'];
export const STRUCTURE_IN_PROGRESS_STATUS = ['En cours', 'Remise en cours'];
export const STRUCTURE_COMPLETED_STATUS = ["Achevé", "Réception technique", "Réception provisoire", "Réception définitive"];
export const STRUCTURE_COMPLETED_ONLY_STATUS = ["Achevé"];
export const STRUCTURE_PROVISIONAL_ACCEPTANCE_STATUS = ["Réception provisoire", "Réception définitive"];
export const STRUCTURE_FINAL_ACCEPTANCE_STATUS = ["Réception définitive"];
export const STRUCTURE_IN_PROGRESS_ALL_STATUS = STRUCTURE_IN_PROGRESS_STATUS+['Superstructure en cours'];
export const STRUCTURE_COMPLETED_ALL_STATUS = STRUCTURE_COMPLETED_STATUS+['provisoire', 'réception', 'réceptionné', 'terminée', 'Superstructure construite', 'superstructure'];
