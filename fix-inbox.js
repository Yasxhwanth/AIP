const fs = require('fs');
const pf = 'frontend/src/app/inbox/page.tsx';
let txt = fs.readFileSync(pf, 'utf8');

const target = `    const handleApprove = async () => {
        if (!selectedItem) return;
        try {
            await ApiClient.post(\`/decisions/\${selectedItem.logicalId}/evaluate\`, {
                ruleId: selectedItem.decisionRuleId
            });
            // Remove from local state after approval
            setInboxItems(prev => prev.filter(i => i.id !== selectedItem.id));
            setSelectedItem(null);
        } catch (err) {
            console.error(err);
        }
    };`;

const repl = `    const handleApprove = async () => {
        if (!selectedItem) return;
        try {
            // Execute the action natively
            await ApiClient.post(\`/decision-logs/\${selectedItem.id}/execute\`, {});
            // Remove from local state after approval
            setInboxItems(prev => prev.filter(i => i.id !== selectedItem.id));
            setSelectedItem(null);
            alert(\`Successfully executed action for Element [\${selectedItem.logicalId}]\`);
        } catch (err) {
            console.error(err);
            alert("Action execution failed.");
        }
    };`;

fs.writeFileSync(pf, txt.replace(target, repl));
console.log('Replaced handleApprove');
