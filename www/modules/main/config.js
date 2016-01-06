'use strict';

module.exports = {
  root: window.location.pathname.replace(/\/(?:index.html)?$/, ''),
  //serveur Demo
  coreUrl: 'http://151.80.132.63/obf-back',
  apiUrl: 'http://151.80.132.63/obf-back/obfmobileapi',

  //serveur local
  //test mobile
  /*coreUrl: 'http://192.168.0.17/DRUPAL/OBF_BACK/www',
  	apiUrl: 'http://192.168.0.17/DRUPAL/OBF_BACK/www/api',*/

  /*coreUrl: 'http://192.168.1.67/DRUPAL/OBF_BACK/www',
  	apiUrl: 'http://192.168.1.67/DRUPAL/OBF_BACK/www/obfmobileapi',*/

  //test desktop
  // coreUrl: 'http://localhost/DRUPAL/OBF_BACK/www',
  // apiUrl: 'http://localhost/DRUPAL/OBF_BACK/www/obfmobileapi',
  dateLabel: 'jj/mm/aaaa hh:mm:ss',
  dateFormats: ['DD/MM/YYYY', 'DD/MM/YYYY HH:mm:ss'],
  clueEnvironments: {
    sous_bois: {
      x: 0.25,
      y: 0.25
    },
    feuillus: {
      x: 0.50,
      y: 0.25
    },
    coniferes: {
      x: 0.75,
      y: 0.25
    },
    prairie: {
      x: 0.25,
      y: 0.50
    },
    milieu_humide: {
      x: 0.50,
      y: 0.50
    },
    lisiere: {
      x: 0.75,
      y: 0.50
    },
    clairiere: {
      x: 0.50,
      y: 0.75
    }
 }
};
