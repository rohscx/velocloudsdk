const auth = require('./lib/auth.js');
const authCookie = require('./lib/authCookie.js');
const enterpriseIdOptions = require('./lib/enterpriseIdOptions.js');
const dataFilter = require('./lib/dataFilter.js');
const enterpriseId = require('./lib/enterpriseId.js');
const enterpriseEdge = require('./lib/enterpriseEdge.js');
const edgeConfigurationStack = require('./lib/edgeConfigurationStack.js');

const enterpriseUsers = require('./lib/enterpriseUsers.js');
const enterpriseConfigurations = require('./lib/enterpriseConfigurations');
const authCheck = require('./lib/authCheck.js');
const edgeBuisnessPolicyFirewall = require('./lib/edgeBuisnessPolicyFirewall.js');
const edgeBuisnessPolicyNat = require('./lib/edgeBuisnessPolicyNat.js');
const edgeBuisnessPolicy = require('./lib/edgeBuisnessPolicy.js');

const enterpriseBuisnessPolicy = require('./lib/enterpriseBuisnessPolicy.js');

const {
  objectKeyFilter,
  writeFile,
  flattenArray,
  readFile,
  formatFileNameNtfs,
} = require('nodeutilz');
const { Parser } = require('json2csv');

const filePath1 = './export/json/edgeData.json';
const filePath2 = './export/json/downEdges.json';
const filePath3 = './export/json/edgeNetworks.json';
const filePath4 = './export/json/authCheck.json';
const filePath8 = './export/json/edgeSerialNumbers.json';
const filePath5 = data => `./export/csv/edgeBuisnessPoliciesFirewall_${data}.csv`;
const filePath6 = data => `./export/json/enterpriseUsers_${data}.json`;
const filePath7 = data => `./export/csv/enterpriseUsers_${data}.csv`;
const filePath9 = data => `./export/csv/enterpriseBuisnessPolicies_${data}.csv`;
const filePath10 = data => `./export/csv/enterpriseBuisnessPoliciesNAT_${data}.csv`;
const filePath11 = data => `./export/json/enterpriseBuisnessPolicies_${data}.json`;
const filePath12 = data => `./export/json/getEdgeConfigurationStack${data}.json`;
const fileEncoding = 'utf8';

// Validates that the API is reachable and returning good data about the target enterprise
const accountStatusCheck = false;
/*
// simple search using the results of the edgeNetowrks.json file
data.prototype.siteSearchIp
const siteSearchIp = (data,searchString) => {
    return data.map(({networks, name}) => ({name,networks:networks.filter(({cidrIp}) => cidrIp !== null).filter(({cidrIp}) => cidrIp.search(searchString) != -1)})).filter(({networks}) => networks.length > 0);
}
const siteSearchName = (data,searchString) => {
    return data.filter(({name}) => name.toLowerCase().search(searchString) != -1);
}

// extends Array prototype 
Array.prototype.siteSearchIp = function (searchString) {
    return this.map(({networks, name}) => ({name,networks:networks.filter(({cidrIp}) => cidrIp !== null).filter(({cidrIp}) => cidrIp.search(searchString) != -1)})).filter(({networks}) => networks.length > 0);
}

Array.prototype.siteSearchName = function (searchString) {
    return this.filter(({name}) => name.toLowerCase().search(searchString) != -1);
}

*/
if (accountStatusCheck) {
  auth()
    .then(t => authCookie(t))
    .then(authCheck)
    .then(t => writeFile(filePath4, JSON.stringify(t), fileEncoding))
    .then(console.log)
    .catch(console.log);
} else {
  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseEdge(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t => writeFile(filePath1, JSON.stringify(t), fileEncoding))
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseEdge(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t =>
      Promise.all(
        flattenArray(
          t.map(d => d.enterprise.enterpriseEdge.map(d => d))
        ).filter(f => f.edgeState != 'CONNECTED')
      )
    )
    .then(t => writeFile(filePath2, JSON.stringify(t), fileEncoding))
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseEdge(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t =>
      Promise.all(
        flattenArray(t.map(d => d.enterprise.enterpriseEdge.map(d => d))).map(
          d => ({
            name: d.name,
            modelNumber: d.modelNumber,
            mgmt:
              d.configuration.enterprise.modules[0].edgeSpecificData.lan
                .management,
            networks:
              d.configuration.enterprise.modules[0].edgeSpecificData.lan
                .networks,
          })
        )
      )
    )
    .then(t => writeFile(filePath3, JSON.stringify(t), fileEncoding))
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseEdge(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t => edgeBuisnessPolicyFirewall(t))
    .then(t =>
      Promise.all(
        t.map(({ enterpriseName, csvData }, i) =>
          writeFile(filePath5(`${formatFileNameNtfs(enterpriseName)}`), csvData, fileEncoding)
        )
      )
    )
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseUsers(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t =>
      Promise.all(
        t.map(({ enterprise: { enterpriseName, enterpriseEdge } }) =>
          writeFile(
            filePath6(formatFileNameNtfs(enterpriseName)),
            JSON.stringify(flattenArray(enterpriseEdge), null, '\t'),
            fileEncoding
          )
        )
      )
    )
    .then(t =>
      Promise.all(
        t.map(d =>
          readFile(d).then(t => {
            const jsonData = JSON.parse(t);
            const renameFile = d.split('.json')[0];
            const fileName = renameFile.split('/')[3].split('_')[1];
            const objectKeys = [
              'username',
              'firstName',
              'lastName',
              'email',
              'isActive',
              'isLocked',
              'lastLogin',
              'modified',
              'roleName',
            ];
            const opts = { fields: objectKeys };
            const myparseData = new Parser(opts);
            const csv = myparseData.parse(jsonData);
            return writeFile(filePath7(formatFileNameNtfs(fileName)), csv, fileEncoding);
          })
        )
      )
    )
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseEdge(t))
    .then(t => objectKeyFilter(t, ['enterprise']))
    .then(t =>
      Promise.all(
        flattenArray(t.map(d => d.enterprise.enterpriseEdge.map(d => d))).map(
          d => ({
            name: d.name,
            modelNumber: d.modelNumber,
            serial: d.serialNumber,
            mgmt:
              d.configuration.enterprise.modules[0].edgeSpecificData.lan
                .management,
          })
        )
      )
    )
    .then(t => writeFile(filePath8, JSON.stringify(t), fileEncoding))
    .then(console.log)
    .catch(console.log);

  auth()
    .then(t => authCookie(t))
    .then(t => dataFilter(t, data => data.metaData.auth == true))
    .then(t => enterpriseIdOptions(t))
    .then(t => enterpriseId(t))
    .then(t => enterpriseConfigurations(t))
    .then(t => enterpriseBuisnessPolicy(t))
    .then(t =>
      Promise.all(
        t.map(({ enterpriseName, description, csvData }, i) =>
          writeFile(
            filePath9(`${formatFileNameNtfs(enterpriseName)}`),
            csvData,
            fileEncoding
          )
        )
      )
    )
    .then(console.log)
    .catch(console.log);


  auth()
  .then(t => authCookie(t))
  .then(t => dataFilter(t, data => data.metaData.auth == true))
  .then(t => enterpriseIdOptions(t))
  .then(t => enterpriseId(t))
  .then(t => enterpriseEdge(t))
  .then(t => objectKeyFilter(t, ['enterprise']))
  .then(t => edgeBuisnessPolicyNat(t))
  .then(t =>
    Promise.all(
      t.map(({ enterpriseName, csvData }, i) =>
        writeFile(filePath10(`${formatFileNameNtfs(enterpriseName)}`), csvData, fileEncoding)
      )
    )
  )
  .then(console.log)
  .catch(console.log);

  auth()
  .then(t => authCookie(t))
  .then(t => dataFilter(t, data => data.metaData.auth == true))
  .then(t => enterpriseIdOptions(t))
  .then(t => enterpriseId(t))
  .then(t => enterpriseEdge(t))
  .then(t => objectKeyFilter(t, ['enterprise']))
  .then(t => edgeBuisnessPolicy(t))
  .then(t =>
    Promise.all(
      t.map(({ enterpriseName, combinedResult }, i) =>
        writeFile(filePath11(`${formatFileNameNtfs(enterpriseName)}`), JSON.stringify((combinedResult) , null, '\t'), fileEncoding)
      )
    )
  )
  // .then((t) => JSON.stringify(t,null,'\t'))
  .then(console.log)
  .catch(console.log);

  auth()
  .then(t => authCookie(t))
  .then(t => dataFilter(t, data => data.metaData.auth == true))
  .then(t => enterpriseIdOptions(t))
  .then(t => enterpriseId(t))
  .then(t => enterpriseEdge(t))
  //.then(t => objectKeyFilter(t, ['enterprise']))
  .then(t => edgeConfigurationStack(t))
  .then((t) => writeFile(filePath12(``), JSON.stringify((t[0][0].testEmpty) , null, '\t'), fileEncoding))
  .then(console.log)
  .catch(console.log);

}
