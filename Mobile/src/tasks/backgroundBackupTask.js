import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { loadPendingIntent, clearPendingIntent, runBackupBatch } from '../services/galleryBackupEngine';

export const GALLERY_BACKUP_TASK = 'zapchat-gallery-backup-task';

// Stay comfortably under the OS's background execution budget so the task
// finishes cleanly rather than being killed mid-upload.
const TIME_BUDGET_MS = 25000;

// Must run at module scope (imported once at app startup) so the OS can
// invoke it even when the app isn't running in the foreground.
TaskManager.defineTask(GALLERY_BACKUP_TASK, async () => {
  try {
    const intent = await loadPendingIntent();
    if (!intent) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const { exhausted } = await runBackupBatch({
      mode: intent.mode,
      albumIds: intent.albumIds,
      control: { cancelled: false, paused: false },
      timeBudgetMs: TIME_BUDGET_MS,
    });

    if (exhausted) {
      await clearPendingIntent();
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.log('gallery backup background task error', error.message);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundBackupTaskAsync() {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) return;
    await BackgroundTask.registerTaskAsync(GALLERY_BACKUP_TASK, { minimumInterval: 15 });
  } catch (error) {
    console.log('registerBackgroundBackupTaskAsync error', error.message);
  }
}

export async function unregisterBackgroundBackupTaskAsync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GALLERY_BACKUP_TASK);
    if (isRegistered) {
      await BackgroundTask.unregisterTaskAsync(GALLERY_BACKUP_TASK);
    }
  } catch (error) {
    console.log('unregisterBackgroundBackupTaskAsync error', error.message);
  }
}
