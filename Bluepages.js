/*
 * Copyright (C) 2020 International Business Machines Corporation and others. All Rights Reserved.
 * The accompanying program is provided under the terms of the IBM public license ("agreement").
 * Written by Andres Romero <aromeroh@cr.ibm.com>, August 2019.
 * Contributors: Rod Anami <rod.anami@br.ibm.com>, Holly Cummins <cumminsh@uk.ibm.com>
*/
const fetch = require('node-fetch');
const LDAP = require('ldapjs');
const JsonUtils = require('./utils/JsonUtils');
const urls = require('./URLs');

const ORG = 'ou=bluepages,o=ibm.com';

async function bluepagesGetEmployeeByW3ID(W3ID) {
	return fetch(urls.api + `?ibmperson/mail=${W3ID}.list/byjson`)
		.then(res => res.json())
		.then(json => JsonUtils.objectiseOne(json))
		.catch(error => console.error(`Error: ${error}`));
}

async function expBluepagesGetEmployeeByW3ID(W3ID) {
	return fetch(urls.apiv2 + `?emails=${W3ID}`)
		.then(res => res.json())
		.then(json => {
				if (json[0]) {
					return json[0].content.profile;
				} else {
					return null;
				}
		})
		.catch(error => console.error(`Error: ${error}`));
}

async function bluepagesGetEmployeeByUID(UID) {
	return fetch(urls.api + `?ibmperson/uid=${UID}.list/byjson`)
		.then(res => res.json())
		.then(json => JsonUtils.objectiseOne(json))
		.catch(error => console.error(`Error: ${error}`));
}

async function bluePagesReportsQueryByDn(dn) {
	return fetch(urls.api + `?ibmperson/manager=${dn}.list/byjson`)
		.then(res => res.json())
		.catch(error => console.error(`Error: ${error}`));
}

async function getDnByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);

	if (employee !== null) {
		const { uid, c, ou, o } = employee;
		return `uid=${uid},c=${c},ou=${ou},o=${o}`;
	} else {
		return null; // Not longer employee / not found
	}
}

/**
* @param {String} W3ID
* @param {String} password
* @returns {Promise<boolean>}
*/
async function authenticate(W3ID, password) {
	const dn = await getDnByW3ID(W3ID);

	return new Promise((resolve, reject) => {

		if (dn === null) {
			resolve(false);
		}

		const uid = dn.split(/,/)[0].split(/=/)[1];

		const opts = {
			filter: '(uid='+ uid +')',
			timeLimit: 500,
			scope: 'sub'
		};

		// * Client for connecting to Bluepages LDAPS interface
		const CLIENT = LDAP.createClient({ url: urls.ldaps });

		CLIENT.bind(dn, password, function (error) {
			if (error) {
				CLIENT.unbind();
				resolve(false);
			} else {
				CLIENT.search(ORG, opts, function(error, res) {
					res.on('searchEntry', function(entry) {
						if(entry.object){
							CLIENT.unbind();
							resolve(true);
						} else {
							CLIENT.unbind();
							resolve(false);
						}
					});

					res.on('error', function(error) {
						CLIENT.unbind();
						resolve(false);
					});
				});
			}
		});
	});
}

/**
* @param {String} W3ID
* @returns {Promise<boolean>}
*/
async function ldapGetEmployeeByW3ID(W3ID, attributes=[]) {
	return new Promise((resolve, reject) => {
		// * Client for connecting to Bluepages LDAPS interface
		const CLIENT = LDAP.createClient({ url: urls.ldaps });
		const opts = {
			filter: '(mail='+W3ID+')',
			scope: 'sub',
			attributes: attributes,
			sizeLimit: 1,
			timeLimit: 30
		};
		// Anonymous LDAP binding
		CLIENT.bind('', '', function(error) {
		  if (error) {
		    	CLIENT.unbind();
				reject(err);
		  } else {
		    	CLIENT.search(ORG, opts, function(err, res) {
				res.on('searchEntry', function(entry) {
					if(entry.object){
								CLIENT.unbind();
						resolve(entry.object);
					} else {
						CLIENT.unbind();
						resolve(null);
					}
				});

		      	res.on('error', function(resErr) {
		        	CLIENT.unbind();
					reject(resErr);
		      	});
		    });
		  }
		});
	});
}

/**
* @param {String} UID
* @returns {Promise<boolean>}
*/
async function ldapGetEmployeeByUID(UID, attributes=[]) {
	return new Promise((resolve, reject) => {
		// * Client for connecting to Bluepages LDAPS interface
		const CLIENT = LDAP.createClient({ url: urls.ldaps });
		const opts = {
			filter: '(uid='+UID+')',
			scope: 'sub',
			attributes: attributes,
			sizeLimit: 1,
			timeLimit: 30
		};
		// Anonymous LDAP binding
		CLIENT.bind('', '', function(error) {
		  if (error) {
		    	CLIENT.unbind();
				reject(error);
		  } else {
		    CLIENT.search(ORG, opts, function(err, res) {
				res.on('searchEntry', function(entry) {
					if(entry.object){
						CLIENT.unbind();
						resolve(entry.object);
					} else {
						CLIENT.unbind();
						resolve(null);
					}
					});

		      	res.on('error', function(resErr) {
		       	 	CLIENT.unbind();
					reject(resErr);
		      	});
		    });
		  }
		});
	});
}


/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getNameByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	return employee.cn;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getUIDByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	return employee.uid;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getW3IDByUID(UID) {
	const employee = await bluepagesGetEmployeeByUID(UID);
	return employee.mail;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getManagerUIDByEmployeeW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	const serialNumber = employee.managerserialnumber;
	const countryCode = employee.managercountrycode;

	return serialNumber + countryCode;
}

/**
* @param {String} W3ID
* @returns {Promise<Object>}
*/
async function getEmployeeLocationByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);

	return {
		buildingName: employee.buildingname,
		country: employee.co,
		countryAlphaCode: employee.c,
		workLocation: employee.workloc,
		employeeCountryCode: employee.employeecountrycode
	};
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getEmployeePhoneByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	return employee.telephonenumber;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getJobFunctionByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	return employee.jobresponsibilities;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getEmployeeMobileByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	return employee.mobile;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getGlobalManagerUIDByW3ID(W3ID) {
	const attributes = ['glTeamLead'];
	const employee = await ldapGetEmployeeByW3ID(W3ID, attributes);
	if (employee.glTeamLead) {
		const uid = employee.glTeamLead.split(/,/)[0].split(/=/)[1];
		return uid;
	} else {
		return null;
	}
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getSlackInfoByW3ID(W3ID) {
	const employee = await expBluepagesGetEmployeeByW3ID(W3ID);
	if (employee.preferredSlackId && employee.preferredSlackUsername) {
		return {
			slackId: employee.preferredSlackId,
			slackUser: employee.preferredSlackUsername
		}
	} else {
		return null;
	}
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getConferenceInfoByW3ID(W3ID) {
	const employee = await expBluepagesGetEmployeeByW3ID(W3ID);
	if (employee.conferenceUrl) {
		return employee.conferenceUrl;
	} else {
		return null;
	}
}


/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getPhotoByW3ID(W3ID) {
	return urls.photo + `/${W3ID}?def=avatar`;
}

/**
* @param {String} W3ID
* @returns {Promise<Object>}
*/
async function getEmployeeInfoByW3ID(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);

	return {
		name: employee.cn,
		title: employee.title,
		photo: urls.photo + `/${W3ID}?def=avatar`,
		mail: employee.mail,
		telephoneNumber: employee.telephonenumber,
		serialNumber: employee.serialNumber,
		contryCode: employee.employeeCountryCode,
		division: employee.div,
		department: employee.dept,
		callupName: employee.callupName,
		type: employee.employeeType,
	};
}

/**
* @param {String} UID
* @returns {Promise<Object>}
*/
async function getEmployeeInfoByUID(UID) {
	const employee = await ldapGetEmployeeByUID(UID);

	return {
		name: employee.cn,
		title: employee.title,
		photo: urls.photo + `/${UID}?def=avatar`,
		mail: employee.mail,
		telephoneNumber: employee.telephonenumber,
		serialNumber: employee.serialNumber,
		contryCode: employee.employeeCountryCode,
		division: employee.div,
		department: employee.dept,
		callupName: employee.callupName,
		type: employee.employeeType,
	};
}

/**
* @param {String} W3ID
* @returns {Promise<Array<Object>>}
*/
async function getDirectReportsByW3ID(W3ID) {
	const dn = await getDnByW3ID(W3ID);
	return await getDirectReportsByDn(dn);
}

async function getDirectReportsByDn(dn) {
  const allReports = await bluePagesReportsQueryByDn(dn);
  const json = JsonUtils.objectiseMany(allReports);

  // Extract just a few fields of interest
  return json.map(person => {
    return {
      name: person.cn,
      dn: `uid=${person.uid},c=${person.c},ou=${person.ou},o=${person.o}`,
      uid: person.uid,
      mail: person.mail,
      workLocation: person.workloc
    };
  });
}

/**
* @param {String} W3ID
* @returns {Promise<Array<Object>>}
*/
async function getDirectAndIndirectReportsByW3ID(W3ID) {
  const dn = await getDnByW3ID(W3ID);
  return await getDirectAndIndirectReportsByDn(dn);
}

async function getDirectAndIndirectReportsByDn(dn) {
  // This is only doing the in-country hierarchy; global seems to be much harder
  // It would be nice to have an option to filter out functional and task IDs
  const directReports = await getDirectReportsByDn(dn);
  const recurser = async person => [person].concat(await getDirectAndIndirectReportsByDn(person.dn));
  const recursed = await Promise.all(directReports.map(recurser));
  const flattened = JsonUtils.flatten(recursed);

  return flattened;
}

/**
* @param {String} W3ID
* @returns {Promise<boolean>}
*/
async function isManager(W3ID) {
	const employee = await bluepagesGetEmployeeByW3ID(W3ID);
	const flag = getAttrValue('ismanager', employee);

	return (flag === 'Y'); // Y: True, N: False ...
}

/**
* @param {String} W3ID
* @returns {Promise<boolean>}
*/
async function employeeExists(W3ID) {
	return (await getDnByW3ID(W3ID) !== null);
}

module.exports = {
	authenticate,
	getNameByW3ID,
	getUIDByW3ID,
	getManagerUIDByEmployeeW3ID,
	getGlobalManagerUIDByW3ID,
	getEmployeeLocationByW3ID,
	getEmployeeMobileByW3ID,
	getEmployeePhoneByW3ID,
	getConferenceInfoByW3ID,
	getSlackInfoByW3ID,
	getJobFunctionByW3ID,
	getPhotoByW3ID,
	getEmployeeInfoByW3ID,
	getEmployeeInfoByUID,
	getDirectAndIndirectReportsByW3ID,
	getDirectReportsByW3ID,
	getW3IDByUID,
	isManager,
	employeeExists
};
