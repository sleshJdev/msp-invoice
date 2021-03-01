const crypto = require('crypto')
const http = require('https')

const sha256 = (message) => {
    return crypto.createHash('sha256')
        .update(message).digest('hex');
}

const sha1 = (message) => {
    return crypto.createHash('sha1')
        .update(message).digest('hex');
}

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
).toString('base64')

const get = (path, headers) => {
    return new Promise((resolve, reject) => {
        http.get(`https://sc1.seamless-it.com/api/v1.0${path}`, {
            headers
        }, (response) => {
            let data = '';
            response.on('data', chunk => (data += chunk))
            response.on('end', () => resolve(JSON.parse(data)))
            response.on('error', (err) => {
                reject(err)
            })
        })
    })
}

const requestToken = async () => {
    return get('/auth', {
        Authorization: `Basic ${claim}`
    })
}

const fetchProcs = async (token) => {
    return get('/automation/agentprocs', {
        Authorization: `Bearer ${token}`
    })
}

const fetchMachineGroups = (token, orgId) => {
    return get(`/system/orgs/${orgId}/machinegroups`, {
        Authorization: `Bearer ${token}`
    })
}

const fetchOrganizations = (token) => {
    return get('/system/orgs', {
        Authorization: `Bearer ${token}`
    })
}

const fetchAuditSummaries = (token) => {
    return get('/assetmgmt/audit', {
        Authorization: `Bearer ${token}`
    })
}

const fetchUser = (token, userId) => {
    return get(`/system/users/${userId}`, {
        Authorization: `Bearer ${token}`
    })
}

(async () => {
    const authInfo = await requestToken()
    const { Result: { ApiToken, Token, AdminId } } = authInfo
    const summaries = await fetchAuditSummaries(ApiToken)
    const procs = await fetchProcs(ApiToken)
    console.log(JSON.stringify(procs, null, 2))
})()
