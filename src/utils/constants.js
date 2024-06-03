const taskContractAddressSepolia = '0x7851f5fA02C1e323cF89dCBad50CBB294b2332C8';
import TaskScheduling from './TaskScheduling.json';
const workerContractAddressSepolia = '0x7bC4218f017C7962743404959070645bD6D4ecE5';
import RegisterWorker from './WorkerRegistration.json';

const taskContractABI = TaskScheduling.abi
const workerContractABI = RegisterWorker.abi
export { taskContractABI, taskContractAddressSepolia, workerContractABI, workerContractAddressSepolia };