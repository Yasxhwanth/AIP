const fs = require('fs');
const path = require('path');

const files = [
    {
        name: 'frontend/src/app/telemetry/page.tsx',
        replacements: [
            { from: /useState<any\[\]>\(\[\]\);/g, to: 'useState<any[]>([]);' }, // Wait, telemetry uses assetTree (any), rollups (TelemetryRollup), etc.
            { from: /const \[rollups, setRollups\] = useState<any\[\]>\(\[\]\);/g, to: 'const [rollups, setRollups] = useState<T.TelemetryRollup[]>([]);' },
            { from: /ApiClient\.get<any\[\]>\('\/entity-types'\)/g, to: "ApiClient.get<T.EntityType[]>('/entity-types')" },
            { from: /ApiClient\.get<any\[\]>\(`\/entity-types\/\$\{t\.id\}\/instances`\)/g, to: "ApiClient.get<T.EntityInstance[]>(`/entity-types/${t.id}/instances`)" },
            { from: /ApiClient\.get<any\[\]>\(`\/telemetry\/\$\{selectedAsset\}\/rollups`\)/g, to: "ApiClient.get<T.TelemetryRollup[]>(`/telemetry/${selectedAsset}/rollups`)" }
        ]
    },
    {
        name: 'frontend/src/app/ontology/page.tsx',
        replacements: [
            { from: /useState<any\[\]>\(\[\]\);/g, to: 'useState<any[]>([]);' }, // fallback
            { from: /useState<any\[\]>\(/g, to: 'useState<any[]>(' }, // fallback
            { from: /const \[entityTypes, setEntityTypes\] = useState<any\[\]>\(/g, to: 'const [entityTypes, setEntityTypes] = useState<T.EntityType[]>(' },
            { from: /const \[links, setLinks\] = useState<any\[\]>\(/g, to: 'const [links, setLinks] = useState<T.RelationshipDefinition[]>(' },
            { from: /ApiClient\.get<any\[\]>\('\/entity-types'\)/g, to: "ApiClient.get<T.EntityType[]>('/entity-types')" },
            { from: /ApiClient\.get<any\[\]>\(`\/entity-types\/\$\{obj\.id\}\/outgoing-relationships`\)/g, to: "ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${obj.id}/outgoing-relationships`)" },
            { from: /ApiClient\.get<any\[\]>\(`\/entity-types\/\$\{selectedObj\.id\}\/outgoing-relationships`\)/g, to: "ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${selectedObj.id}/outgoing-relationships`)" }
        ]
    },
    {
        name: 'frontend/src/app/models/page.tsx',
        replacements: [
            { from: /const \[models, setModels\] = useState<any\[\]>\(/g, to: 'const [models, setModels] = useState<T.ModelDefinition[]>(' },
            { from: /const \[versions, setVersions\] = useState<any\[\]>\(/g, to: 'const [versions, setVersions] = useState<T.ModelVersion[]>(' },
            { from: /ApiClient\.get<any\[\]>\('\/models'\)/g, to: "ApiClient.get<T.ModelDefinition[]>('/models')" },
            { from: /ApiClient\.get<any\[\]>\(`\/models\/\$\{selectedModel\.id\}\/versions`\)/g, to: "ApiClient.get<T.ModelVersion[]>(`/models/${selectedModel.id}/versions`)" }
        ]
    },
    {
        name: 'frontend/src/app/integrations/page.tsx',
        replacements: [
            { from: /const \[dataSources, setDataSources\] = useState<any\[\]>\(/g, to: 'const [dataSources, setDataSources] = useState<T.DataSource[]>(' },
            { from: /const \[jobs, setJobs\] = useState<any\[\]>\(/g, to: 'const [jobs, setJobs] = useState<T.IntegrationJob[]>(' },
            { from: /const \[entityTypes, setEntityTypes\] = useState<any\[\]>\(/g, to: 'const [entityTypes, setEntityTypes] = useState<T.EntityType[]>(' },
            { from: /ApiClient\.get<any\[\]>\('\/data-sources'\)/g, to: "ApiClient.get<T.DataSource[]>('/data-sources')" },
            { from: /ApiClient\.get<any\[\]>\('\/integration-jobs'\)/g, to: "ApiClient.get<T.IntegrationJob[]>('/integration-jobs')" },
            { from: /ApiClient\.get<any\[\]>\('\/entity-types'\)/g, to: "ApiClient.get<T.EntityType[]>('/entity-types')" }
        ]
    },
    {
        name: 'frontend/src/app/inbox/page.tsx',
        replacements: [
            { from: /const \[inboxItems, setInboxItems\] = useState<any\[\]>\(/g, to: 'const [inboxItems, setInboxItems] = useState<T.DecisionLog[]>(' },
            { from: /ApiClient\.get<any\[\]>\('\/decision-logs\?status=PENDING'\)/g, to: "ApiClient.get<T.DecisionLog[]>('/decision-logs?status=PENDING')" }
        ]
    },
    {
        name: 'frontend/src/app/geo/page.tsx',
        replacements: [
            { from: /ApiClient\.get<any\[\]>\('\/entity-types'\)/g, to: "ApiClient.get<T.EntityType[]>('/entity-types')" },
            { from: /ApiClient\.get<any\[\]>\(`\/entity-types\/\$\{t\.id\}\/instances`\)/g, to: "ApiClient.get<T.EntityInstance[]>(`/entity-types/${t.id}/instances`)" }
        ]
    },
    {
        name: 'frontend/src/app/files/page.tsx',
        replacements: [
            { from: /const \[entityTypes, setEntityTypes\] = useState<any\[\]>\(/g, to: 'const [entityTypes, setEntityTypes] = useState<T.EntityType[]>(' },
            { from: /ApiClient\.get<any\[\]>\('\/entity-types'\)/g, to: "ApiClient.get<T.EntityType[]>('/entity-types')" }
        ]
    }
];

files.forEach(f => {
    if (fs.existsSync(f.name)) {
        let content = fs.readFileSync(f.name, 'utf8');

        const hasTypesImport = content.includes("import * as T from '@/lib/types';");
        if (!hasTypesImport) {
            content = content.replace(/import \{ ApiClient \} from "@\/lib\/apiClient";/, "import { ApiClient } from \"@/lib/apiClient\";\nimport * as T from '@/lib/types';");
        }

        f.replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        fs.writeFileSync(f.name, content);
        console.log(`Processed ${f.name}`);
    }
});
