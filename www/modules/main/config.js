'use strict';

module.exports = {
	root: window.location.pathname.replace(/\/(?:index.html)?$/, ''),
	//serveur Demo
	// coreUrl: 'http://151.80.132.63/obf-back',
	// apiUrl: 'http://151.80.132.63/obf-back/api',
	
	//serveur local
	//test mobile
	coreUrl: 'http://192.168.0.17/DRUPAL/OBF_BACK/www',
	apiUrl: 'http://192.168.0.17/DRUPAL/OBF_BACK/www/api',

	//test desktop
	// coreUrl: 'http://localhost/DRUPAL/OBF_BACK/www',
	// apiUrl: 'http://localhost/DRUPAL/OBF_BACK/www/api',
	dateLabel: 'jj/mm/aaaa hh:mm:ss',
	dateFormats: ['DD/MM/YYYY', 'DD/MM/YYYY HH:mm:ss']
};