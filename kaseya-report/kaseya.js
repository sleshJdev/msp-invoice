const fs = require('fs');
const {
    fetchProcs,
    fetchAgents,
    fetchPatchStatus,
    fetchAuditSummaries,
    fetchAgentSummary,
    fetchSecurityProducts,
    fetchPatchHistory,
    fetchMissingPatches,
    fetchAgentProcedureHistory,
    fetchLogmonitoring
} = require('kaseya');

class Agents {
    constructor(agents) {
        this.agents = agents
    }

    get serversCount() {
        return this.agents
            .filter(({ OSInfo }) => (OSInfo.includes('Server Standard')))
            .length
    }

    get workStationsCount() {
        return this.agents.length - this.serversCount
    }
}

const onError = (error, data) => {
    if (error) {
        return console.log(error);
    }
}

(async () => {
    const agentId = 125050962640143;

    const procs = await fetchProcs();
    const agents = await fetchAgents().then((it) => (new Agents(it)));
    const auditSummaries = await fetchAuditSummaries();
    const patchHistory = await fetchPatchHistory(agentId);
    const agentSummary = await fetchAgentSummary(agentId);
    const securityProducts = await fetchSecurityProducts(agentId);
    const missingPatches = await fetchMissingPatches(agentId, false);
    const patchStatus = await fetchPatchStatus(agentId);
    const agentProcedureHistory = await fetchAgentProcedureHistory(agentId);
    const logmonitoring = await fetchLogmonitoring(agentId);
    

    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }
    fs.writeFile(`./data/procs.json`, JSON.stringify(procs, null, 2), onError);
    fs.writeFile(`./data/audit-summaries.json`, JSON.stringify(auditSummaries, null, 2), onError);
    fs.writeFile(`./data/agents.json`, JSON.stringify(agents.agents, null, 2), onError);
    fs.writeFile(`./data/${agentId}-path-history.json`, JSON.stringify(patchHistory, null, 2), onError);
    fs.writeFile(`./data/${agentId}-agent-summary.json`, JSON.stringify(agentSummary, null, 2), onError);
    fs.writeFile(`./data/${agentId}-fetch-security-products.json`, JSON.stringify(securityProducts, null, 2), onError);
    fs.writeFile(`./data/${agentId}-missing-patches.json`, JSON.stringify(missingPatches, null, 2), onError);
    fs.writeFile(`./data/${agentId}-patch-status.json`, JSON.stringify(patchStatus, null, 2), onError);
    fs.writeFile(`./data/${agentId}-agent-procedure-history.json`, JSON.stringify(agentProcedureHistory, null, 2), onError);
    fs.writeFile(`./data/${agentId}-logmonitoring.json`, JSON.stringify(logmonitoring, null, 2), onError);
    // for (let agent of agents.agents) {
        // const logmonitoring1 = await fetchLogmonitoring(agent.AgentId);
        // fs.writeFile(`./data/${agent.AgentId}-logmonitoring.json`, JSON.stringify(logmonitoring1, null, 2), onError);
    // }
    console.log(`
        IT Management Scope
        Service Period: ${new Date().toLocaleDateString()}
        Servers Managed: ${agents.serversCount}
        Workstations Managed: ${agents.workStationsCount}
        --------------------------------------------------------------
        IT Management Results
        Viruses And Other Malware Stopped: -
        Microsoft Security Patches Installed: ${patchHistory.length}
    `);
})()
