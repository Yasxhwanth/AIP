import { ExecutionCommand, ExecutionResult, ExecutionMode } from './execution-types';

export interface Executor {
    execute(command: ExecutionCommand): Promise<ExecutionResult>;
}

export class DryRunExecutor implements Executor {
    async execute(command: ExecutionCommand): Promise<ExecutionResult> {
        // SIMULATION ONLY
        // In a real implementation, this would call a "dry-run" mode on the connector
        // or run a logic simulation without side effects.

        console.log(`[DRY_RUN] Simulating action: ${command.actionType}`, command.parameters);

        return {
            tenantId: command.tenantId,
            success: true,
            output: {
                simulated: true,
                estimatedDurationMs: 120,
                impactedEntities: ['SCENARIO-123', 'BUDGET-2024']
            },
            logs: [
                `[INFO] Starting Dry Run for ${command.actionType}`,
                `[INFO] Validating parameters... OK`,
                `[INFO] Checking resource availability... OK`,
                `[INFO] Simulation complete. No side effects produced.`
            ]
        };
    }
}

import { ActionRegistry } from '../ontology/ActionRegistry';
import { IdentityContext } from '../identity/IdentityContext';
import { ScenarioManager } from '../ontology/ScenarioManager';

export class RealRunExecutor implements Executor {
    async execute(command: ExecutionCommand): Promise<ExecutionResult> {
        // REAL EXECUTION
        // This is the ONLY place that should ever call the actual Action Engine.

        if (command.mode !== ExecutionMode.REAL_RUN) {
            return {
                tenantId: command.tenantId,
                success: false,
                error: {
                    code: 'INVALID_MODE',
                    message: 'RealRunExecutor received non-REAL_RUN command'
                }
            };
        }

        console.log(`[REAL_RUN] Executing action: ${command.actionType}`, command.parameters);

        try {
            // Integrate with ActionRegistry (Phase 35)
            const identityContext = IdentityContext.getInstance().getCurrentContext();

            // SANDBOXING LOGIC:
            // If targetScenarioId is present, we intercept the action and record it as a scenario mutation
            // instead of applying it to the master ontology store.
            if (command.targetScenarioId) {
                console.log(`[SANDBOX] Redirecting action to Scenario: ${command.targetScenarioId}`);

                // For Phase 36, we assume the action produces a set of mutations.
                // In a real system, the Action Engine would return these.
                // Here, we'll simulate recording the action intent as a mutation.
                ScenarioManager.addMutation(
                    command.targetScenarioId,
                    command.parameters.targetEntityId || 'UNKNOWN',
                    'ATTRIBUTE_OVERRIDE', // Simplified mapping
                    command.parameters,
                    new Date()
                );

                return {
                    tenantId: command.tenantId,
                    success: true,
                    output: {
                        scenarioId: command.targetScenarioId,
                        status: 'SANDBOXED'
                    },
                    logs: [
                        `[INFO] Action intercepted for Scenario Sandboxing`,
                        `[INFO] Target Scenario: ${command.targetScenarioId}`,
                        `[INFO] Mutation recorded in scenario branch`,
                        `[INFO] Master ontology remains unchanged.`
                    ]
                };
            }

            // Normal Truth Execution
            ActionRegistry.executeAction(command.actionType, {
                tenantId: command.tenantId,
                userId: identityContext.actor_id,
                parameters: command.parameters
            });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                tenantId: command.tenantId,
                success: true,
                output: {
                    transactionId: 'TX-' + crypto.randomUUID(),
                    status: 'COMPLETED'
                },
                logs: [
                    `[INFO] Starting Real Execution for ${command.actionType}`,
                    `[INFO] Action logic resolved from ActionRegistry`,
                    `[INFO] Mutations applied to OntologyStore`,
                    `[INFO] Side effects triggered`,
                    `[INFO] Execution complete.`
                ]
            };
        } catch (err: any) {
            return {
                tenantId: command.tenantId,
                success: false,
                error: {
                    code: 'EXECUTION_FAILED',
                    message: err.message
                },
                logs: [
                    `[ERROR] Execution failed: ${err.message}`
                ]
            };
        }
    }
}
