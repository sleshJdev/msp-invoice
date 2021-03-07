const crypto = require('crypto');
const http = require('https');
const fs = require('fs');

const sha256 = (message) => {
    return crypto.createHash('sha256')
        .update(message).digest('hex');
};

const sha1 = (message) => {
    return crypto.createHash('sha1')
        .update(message).digest('hex');
};

const username = process.env.USER_NAME
const password = process.env.PASSWORD
const random = 1000000000000000000 * Math.random();
const rawSHA256Hash = sha256(password);
const coveredSHA256HashTemp = sha256(password + username);
const coveredSHA256Hash = sha256(coveredSHA256HashTemp + random);
const rawSHA1Hash = sha1(password);
const coveredSHA1HashTemp = sha1(password + username);
const coveredSHA1Hash = sha1(coveredSHA1HashTemp + random);
const claim = Buffer.from(
    'user=' + username
    + ',pass2=' + coveredSHA256Hash
    + ',pass1=' + coveredSHA1Hash
    + ',rpass2=' + rawSHA256Hash
    + ',rpass1=' + rawSHA1Hash
    + ',rand2=' + random
).toString('base64');

class AuditSummaries {
    constructor(summaries) {
        this.summaries = summaries
    }

    get serversCount() {
        return this.summaries
            .filter(({ OsInfo }) => (OsInfo.includes('Server Standard')))
            .length
    }

    get workStationsCount() {
        return this.summaries.length - this.serversCount
    }
}

const justGet = (path, headers) => {
    return new Promise((resolve, reject) => {
        http.get(`https://sc1.seamless-it.com/api/v1.0${path}`, {
            headers
        }, (response) => {
            let data = '';
            response.on('data', chunk => (data += chunk))
            response.on('end', () => (resolve(JSON.parse(data))))
            response.on('error', (err) => (reject(err)))
        })
    })
};

const get = (() => {
    let effectiveAuthInfo = null
    return (path, headers) => {
        const request = (retried, effectiveHeaders) => (
            justGet(path, effectiveHeaders).then(res => {
                if (!effectiveAuthInfo || (res.ResponseCode === 401 && !retried)) {
                    return requestToken().then(authInfo => {
                        effectiveAuthInfo = authInfo
                        return request(true, {
                            ...effectiveHeaders,
                            Authorization: `Bearer ${effectiveAuthInfo.Result.ApiToken}`
                        })
                    })
                }
                return res
            })
        )
        if (effectiveAuthInfo) {
            return request(false, {
                ...headers,
                Authorization: `Bearer ${effectiveAuthInfo.Result.ApiToken}`
            }).then(res => {
                return res.Result
            })
        }
        return request(false, headers).then(res => {
            return res.Result
        })
    }
})();

const requestToken = async () => {
    return justGet('/auth', {
        Authorization: `Basic ${claim}`
    })
};

const fetchProcs = () => (get('/automation/agentprocs'));
const fetchPatchStatus = (agentId) => (get(`/assetmgmt/patch/${agentId}/status`));
const fetchAuditSummaries = () => (get('/assetmgmt/audit').then(it => new AuditSummaries(it)));
const fetchAgentSummary = (agentId) => (get(`/assetmgmt/audit/${agentId}/summary`));
const fetchSecurityProducts = (agentId) => (get(`/assetmgmt/audit/${agentId}/software/securityproducts`));
const fetchPatchHistory = (agentId) => (get(`/assetmgmt/patch/${agentId}/history`));
const fetchMissingPatches = (agentId, hideDeniedPatches) => (get(`/assetmgmt/patch/${agentId}/machineupdate/${hideDeniedPatches}`));
const fetchAgentProcedureHistory = (agentId) => (get(`/automation/agentprocs/${agentId}/history`));

const fetchUser = (userId) => (get(`/system/users/${userId}`));
const fetchMachineGroups = (orgId) => (get(`/system/orgs/${orgId}/machinegroups`));
const fetchOrganizations = () => (get('/system/orgs'));

const onError = (error, data) => {
    if (error) {
        return console.log(error);
    }
}

(async () => {
    const agentId = 125050962640143;

    const procs = await fetchProcs();
    const auditSummaries = await fetchAuditSummaries();
    const patchHistory = await fetchPatchHistory(agentId);
    const agentSummary = await fetchAgentSummary(agentId);
    const securityProducts = await fetchSecurityProducts(agentId);
    const missingPatches = await fetchMissingPatches(agentId, false);
    const patchStatus = await fetchPatchStatus(agentId);
    const agentProcedureHistory = await fetchAgentProcedureHistory(agentId);

    await fs.writeFile(`procs.json`, JSON.stringify(procs, null, 2), onError);
    await fs.writeFile(`audit-summaries.json`, JSON.stringify(auditSummaries.summaries, null, 2), onError);
    await fs.writeFile(`${agentId}-path-history.json`, JSON.stringify(patchHistory, null, 2), onError);
    await fs.writeFile(`${agentId}-agent-summary.json`, JSON.stringify(agentSummary, null, 2), onError);
    await fs.writeFile(`${agentId}-fetch-security-products.json`, JSON.stringify(securityProducts, null, 2), onError);
    await fs.writeFile(`${agentId}-missing-patches.json`, JSON.stringify(missingPatches, null, 2), onError);
    await fs.writeFile(`${agentId}-patch-status.json`, JSON.stringify(patchStatus, null, 2), onError);
    await fs.writeFile(`${agentId}-agent-procedure-history.json`, JSON.stringify(agentProcedureHistory, null, 2), onError);
    console.log(`
        IT Management Scope
        Service Period: ${new Date().toLocaleDateString()}
        Servers Managed: ${auditSummaries.serversCount}
        Workstations Managed: ${auditSummaries.workStationsCount}
        --------------------------------------------------------------
        IT Management Results
        Viruses And Other Malware Stopped: -
        Microsoft Security Patches Installed: ${patchHistory.length}

    `);
})()
