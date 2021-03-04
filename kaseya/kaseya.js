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
}

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
})()

const requestToken = async () => {
    return justGet('/auth', {
        Authorization: `Basic ${claim}`
    })
}

const fetchProcs = async () => (get('/automation/agentprocs'))

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

const fetchPatchStatus = (agentId) => (get(`/assetmgmt/patch/${agentId}/status`))
const fetchAuditSummaries = () => (get('/assetmgmt/audit'))
const fetchSecurityProducts = (agentId) => (get(`/assetmgmt/audit/${agentId}/software/securityproducts`))
const fetchPatchHistory = (agentId) => (get(`/assetmgmt/patch/${agentId}/history`))

const fetchUser = (token, userId) => {
    return get(`/system/users/${userId}`, {
        Authorization: `Bearer ${token}`
    })
}

(async () => {
    //const authInfo = await requestToken()
    //const { Result: { ApiToken, Token, AdminId } } = authInfo
    const summaries = await fetchAuditSummaries()
    for (let summary of summaries) {
        const patchStatuses = await fetchPatchStatus(summary.AgentGuid)    
        const installedSecurityProducts = await fetchSecurityProducts(summary.AgentGuid)
        const patchHistory = await fetchPatchHistory(summary.AgentGuid)
        console.log(`Agent name: ${summary.DisplayName}, 
            patchStatuses: ${JSON.stringify(patchStatuses, null, 2)}, 
            patchHistory: ${JSON.stringify(patchHistory, null, 2)}`)
    }
    const patchStatuses = await fetchPatchStatus(952862034213546)
    // console.log(summaries.map(it => (it.DisplayName)))
    // console.log(summaries.map(it => (it.DisplayName)).filter(it => it.toLowerCase().includes('server')))
    // const procs = await fetchProcs()
    // console.log(JSON.stringify(procs, null, 2))

    // console.log(JSON.stringify(summaries, null, 2))
})()
