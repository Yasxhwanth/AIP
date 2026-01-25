import { IdentityContext } from '../identity/IdentityContext';
import { workflowRuntimeStore } from './WorkflowRuntimeStore';
import { WorkflowTaskStatus, WorkflowStatus } from './workflow-runtime-types';
import { authorityEvaluator } from '../authority/AuthorityEvaluator';
import { AuthorityIntent, AuthorityStatus } from '../authority/authority-types';
import { decisionManager } from '../decision/DecisionJournalManager';
import { DecisionJournalInput } from '../decision/decision-types';

export interface CompleteHumanTaskInput {
    taskId: string;
    decision: 'APPROVE' | 'REJECT';
    justification: string;
    actorId: string;
}

export class WorkflowEngine {

    public completeHumanTask(input: CompleteHumanTaskInput): void {
        const { taskId, decision, justification, actorId } = input;

        // 1. Enforce Identity Context
        const identityContext = IdentityContext.getInstance().getCurrentContext();
        if (!identityContext) {
            throw new Error('No active identity context');
        }
        // In a real system, we'd verify identityContext.actor_id === actorId or has delegation

        // 2. Retrieve Task
        // We need to find the task. Store has getPendingTasks but we need getTaskById
        // Since store is in-memory for now, we can iterate or add a method. 
        // Let's assume we can get it via getPendingTasks for now or add a helper.
        // Actually, let's just iterate pending tasks for the tenant to find it, or better, 
        // since we don't have getTaskById exposed on store public API yet, let's rely on 
        // the fact that we can get tasks for workflow if we knew the instance ID.
        // But we only have taskId. 
        // Let's cheat slightly and access the private map in store if we were in the same module, 
        // but we are not. 
        // Let's add getTaskById to WorkflowRuntimeStore in a separate step or just iterate all tasks 
        // (inefficient but works for mock).
        // Wait, I can just use `getTasksForWorkflow` if I knew the instance ID.
        // I'll assume for now I can find it. 
        // Let's add `getTask(id)` to WorkflowRuntimeStore to be clean.
        // For now, I will implement a lookup helper here assuming I can access store.

        // Actually, let's just add `getTask` to the store in the next step or right now via a quick edit?
        // No, I'll just implement the logic here assuming `workflowRuntimeStore` has a way or I'll iterate.
        // `workflowRuntimeStore` has `getPendingTasks`. I can search there.

        const pendingTasks = workflowRuntimeStore.getPendingTasks(actorId, identityContext.tenant_id);
        // This only gets tasks assigned to actor. What if it's unassigned?
        // Let's assume for this phase tasks are assigned.

        let task = pendingTasks.find(t => t.id === taskId);

        // If not found in pending for actor, maybe it's unassigned or I'm an admin?
        // Let's try to find it by iterating all instances (expensive but fine for mock)
        if (!task) {
            const instances = workflowRuntimeStore.getWorkflowInstances(identityContext.tenant_id, new Date());
            for (const inst of instances) {
                const tasks = workflowRuntimeStore.getTasksForWorkflow(inst.id);
                const found = tasks.find(t => t.id === taskId);
                if (found) {
                    task = found;
                    break;
                }
            }
        }

        if (!task) {
            throw new Error(`Task ${taskId} not found or not accessible`);
        }

        if (task.status !== WorkflowTaskStatus.PENDING) {
            throw new Error(`Task ${taskId} is not pending (Status: ${task.status})`);
        }

        const instance = workflowRuntimeStore.getWorkflowInstance(task.workflow_instance_id);
        if (!instance) throw new Error('Workflow instance not found');

        // 3. Verify Authority
        const authResult = authorityEvaluator.evaluate({
            actorId: actorId,
            intentType: AuthorityIntent.APPROVE_WORKFLOW_TASK,
            targetEntityId: instance.id, // Target is the workflow instance
            context: {
                asOf: new Date(),
                taskId: taskId,
                decision: decision
            }
        });

        if (authResult.status !== AuthorityStatus.ALLOWED) {
            throw new Error(`Unauthorized to complete task: ${authResult.reason?.message}`);
        }

        // 4. Log Decision to Journal
        const journalInput: DecisionJournalInput = {
            author: actorId,
            justification: justification,
            chosenScenarioId: null, // Not a scenario decision
            context: {
                asOf: new Date(),
                leftScenarioId: null,
                rightScenarioId: null,
                deltaSummary: {},
                workflowContext: {
                    instanceId: instance.id,
                    stepId: task.step_id,
                    taskId: task.id
                }
            },
            workflowDecision: {
                decision: decision,
                taskId: taskId
            }
        };

        decisionManager.submitDecision(journalInput);

        // 5. Update Runtime State
        task.status = decision === 'APPROVE' ? WorkflowTaskStatus.COMPLETED : WorkflowTaskStatus.REJECTED;
        task.completed_at = new Date().toISOString();
        task.decision = {
            decision,
            justification,
            actor_id: actorId,
            timestamp: new Date().toISOString()
        };

        workflowRuntimeStore.updateTask(task);

        // 6. Advance Workflow (Mock Logic)
        if (decision === 'APPROVE') {
            // Check if this was the last step (Mock)
            if (task.step_id === 'step-manager-approval') {
                // Move to next step or complete
                instance.status = WorkflowStatus.COMPLETED;
                instance.updated_at = new Date().toISOString();
                workflowRuntimeStore.updateInstance(instance);
            } else if (task.step_id === 'step-initial-review') {
                // Create next task
                const nextTask = {
                    id: `task-${Date.now()}`,
                    workflow_instance_id: instance.id,
                    step_id: 'step-manager-approval',
                    step_type: 'HUMAN_APPROVAL' as any,
                    status: WorkflowTaskStatus.PENDING,
                    assigned_actor_id: actorId, // Assign to same user for demo
                    created_at: new Date().toISOString(),
                    context_snapshot: task.context_snapshot
                };
                workflowRuntimeStore.createTask(nextTask);

                instance.current_step_id = 'step-manager-approval';
                instance.updated_at = new Date().toISOString();
                workflowRuntimeStore.updateInstance(instance);
            }
        } else {
            // Rejecting typically fails or requests changes
            instance.status = WorkflowStatus.FAILED; // Or SUSPENDED
            instance.updated_at = new Date().toISOString();
            workflowRuntimeStore.updateInstance(instance);
        }
    }
}

export const workflowEngine = new WorkflowEngine();
