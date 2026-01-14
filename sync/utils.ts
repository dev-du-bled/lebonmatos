import { EnqueuedTaskPromise, Task } from "meilisearch";

export const wrappMeiliTask = async (
    task: EnqueuedTaskPromise
): Promise<Task> => {
    const taskresult = await task.waitTask({ timeout: 60000 });
    if (taskresult.error) throw taskresult.error;

    return taskresult;
};
