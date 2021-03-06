<h1> IBM Bluepages JS </h1>
<img alt="David" src="https://img.shields.io/david/rod4n4m1/ibm-bluepages-js">
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/rod4n4m1/ibm-bluepages-js">
<img alt="npm" src="https://img.shields.io/npm/dm/ibm-bluepages-js">
<img alt="NPM" src="https://img.shields.io/npm/l/ibm-bluepages-js">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/rod4n4m1/ibm-bluepages-js">

<p> This module provides a set of functions to help <b>IBM</b> Developers working on internal projects to authenticate and access directory data available on <b>IBM Bluepages</b> using Javascript promises.</p>

<h3>Requirements (MacOS/Windows)</h3>

* Node 10.x / npm v6.x
* Python version 2.7

<b>Note:</b> Depending on your Windows setup <a href="https://www.npmjs.com/package/windows-build-tools">windows-build-tools</a> may need to be installed first. Also, for MacOS users, you should have <b>xcode-select</b> or entire Xcode App installed.

<h3> Install </h3>

```shell
$ npm install ibm-bluepages-js
```

<h3> Uninstall </h3>

```shell
$ npm uninstall ibm-bluepages-js
```

<h3> Change Log </h3>

* `2.0.11`
  * Major security vulnerability fix on inner dependency.
    * Minimist
  * Minor security vulnerability fix on inner dependency.
    * Bump acorn from 5.7.3 to 5.7.4
  * Refactored test suite and updated jest.

* `2.0.10`
  * Implemented LDAP calls to IBM ED which brings richer results with slow response time.
  * Added new functions:
    * `getGlobalManagerUIDByW3ID(W3ID)`
    * `getEmployeeInfoByUID(UID)`
    * `getW3IDByUID(UID)`
  * Refactoring of functions and other minor fixes.

* `2.0.9`
  * Removed old XML dependencies, functions are now implemented to work fully on JSON. (This change is minor and should not affect any exisintg code implementations.
  * Added new functions:
    * `getDirectReportsByW3ID(W3ID)`
    * `getDirectAndIndirectReportsByW3ID(W3ID)`
* `2.0.8`
  * Fixed the problem caused by DTrace dependency of ldapjs on MacOS Catalina devices.
  * Added new function:
    * `getEmployeeMobileByW3ID(W3ID)`

<h3> Usage </h3>

<p> Perform an action based on location: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

async function doSomethingBasedOnLocation() {
  let location = await bluePages.getEmployeeLocationByW3ID('aromeroh@cr.ibm.com');

  if(location.countryAlphaCode === 'CR') {
    // if true code
  } else {
    // if else code
  }
}

```

<p> Define a function to return employee information: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

const userProfile = function(id) {
  return bluePages.getEmployeeInfoByW3ID(id).then(function(result){
    return result;
  }).catch(function(error){
    return error;
  });
};

```

<p> Authenticate an account: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

async function doAccountAuthentication() {
  let success = await bluePages.authenticate('aromeroh@cr.ibm.com', '********');

  if(success) {
    // if true code
  } else {
    // if else code
  }
}

```

<p> Render an employee photo with <a href="https://www.npmjs.com/package/express" target="_blank">Express</a> & <a href="https://www.npmjs.com/package/ejs" target="_blank">EJS</a>: </p>

```javascript

app.get('/profile', async (req, res) => {
  let photo = await bluePages.getPhotoByW3ID('aromeroh@cr.ibm.com');

  res.render('profile.ejs', {
      photo: photo
  });
});

```
```html

<% if (photo) { %>
  <img src="<%= photo %>" alt="User Photo" height="240" width="320">
<% } %>

```

<h3> List of functions available </h3>

* `authenticate(W3ID, password)`
* `employeeExists(W3ID)`
* `getDirectReportsByW3ID(W3ID)`
* `getDirectAndIndirectReportsByW3ID(W3ID)`
* `getEmployeeInfoByUID(UID)`
* `getEmployeeInfoByW3ID(W3ID)`
* `getEmployeeLocationByW3ID(W3ID)`
* `getEmployeeMobileByW3ID(W3ID)`
* `getEmployeePhoneByW3ID(W3ID)`
* `getGlobalManagerUIDByW3ID(W3ID)`
* `getJobFunctionByW3ID(W3ID)`
* `getManagerUIDByEmployeeW3ID(W3ID)`
* `getNameByW3ID(W3ID)`
* `getPhotoByW3ID(W3ID)`
* `getPrimaryUserIdByW3ID(W3ID)`
* `getUIDByW3ID(W3ID)`
* `getW3IDByUID(UID)`
* `isManager(W3ID)`


<h3> Features that make this module secure </h3>
<ul>
  <li>It's designed to only work within the IBM Blue Zone (Secure Network).</li>
  <li>It's designed to use LDAPS as the main authentication method which makes traffic confidential and secure by using Secure Sockets Layer (SSL).</li>
</ul>

<h3> Contributing </h3>
If you want to contribute to the module and make it better, your help is very welcome. You can do so submitting a <b>Pull Request</b>.

<h3> Authors </h3>
Written by Andres Romero <aromeroh@cr.ibm.com>, August 2019.
Contributors: Rod Anami <rod.anami@br.ibm.com>, Holly Cummins <cumminsh@uk.ibm.com>

<h3> License </h3>
This project is licensed under the IBM Public License.
Copyright (c) 2019 IBM
