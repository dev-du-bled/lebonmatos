import { EnqueuedTaskPromise, Task } from "meilisearch";

export const wrappMeiliTask = async (
    task: EnqueuedTaskPromise
): Promise<Task> => {
    const taskresult = await task.waitTask();
    if (taskresult.error) throw taskresult.error;

    return taskresult;
};
