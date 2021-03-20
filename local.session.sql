CREATE TABLE view_agents(AgentId UInt64, AgentName String, Online UInt8, OSInfo String, MachineGroup String) ENGINE=URL('http://kaseya-proxy:8090/api/v1.0/assetmgmt/agents?accept=jsonl', JSONEachRow) SETTINGS input_format_skip_unknown_fields=1;
CREATE TABLE view_patch_history(AgentId UInt64, PatchDataId UInt32, LastPublishedDate String, Ignore UInt8, UpdateTitle String, PatchState UInt8) ENGINE=URL('http://kaseya-proxy:8090/assetmgmt/patch/history?accept=jsonl', JSONEachRow) SETTINGS input_format_skip_unknown_fields=1;
CREATE TABLE agents ENGINE=MergeTree() order by AgentId SETTINGS index_granularity=8192 as select * from view_agents; 
CREATE TABLE patch_history ENGINE=MergeTree() order by AgentId SETTINGS index_granularity=8192 as select * from view_patch_history; 

create table month(id UInt32, shortName String) ENGINE=MergeTree() ORDER BY id SETTINGS index_granularity=8192; 
insert into month(id, shortName) values (1, 'Jan'), (2, 'Feb'), (3, 'Mar'), (4, 'Apr'), (5, 'May'),(6, 'Jun'), (7, 'Jul'), (8, 'Aug'), (9, 'Sep'), (10, 'Oct'),(11, 'Nov'), (12, 'Dec');

-- drop table agents;
-- drop table pathHistory;