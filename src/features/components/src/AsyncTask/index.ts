import AsyncTask from './AsyncTask.vue';
import { exportHandler } from './exportHandler';
import { importHandler } from './importHandler';

AsyncTask.exportHandler = exportHandler;
AsyncTask.importHandler = importHandler;

export default AsyncTask;
