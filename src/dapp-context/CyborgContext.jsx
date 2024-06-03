import React, { useReducer, useContext, useEffect, useState } from 'react'
import { WalletContext, EVENTS } from './Web3Connect'

export const SERVICES = {
  CYBER_DOCK: 'CYBER_DOCK'
}

export const DEPLOY_STATUS = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED'
}

export const DASH_STATE = {
  HOME: 'HOME',
  SERVER: 'SERVER'
}

///
// Initial state for `useReducer`
  
const initialState = {
  // These are the states
    selectedPath: null,
    devMode: false,
    service: null,
    serviceStatus: {
      deployCompute: null,
      deployTask: null
    },
    //determines dashboard sections
    dashboard: {
      section: null,
      //provides information on nodes
      metadata: null
    },
    workerList: null,
    taskMetadata: null,
    taskList: null
}

///
// Actions types for 'useReducer`
const ACTIONS = {
    RESET_PATH: 'RESET_PATH',
    SELECT_PROVIDER: 'SELECT_PROVIDER',
    SELECT_ACCESSOR: 'SELECT_ACCESSOR',
    TOGGLE_DEV_MODE: 'TOGGLE_DEV_MODE',
    SELECT_SERVICE: 'SELECT_SERVICE',
    DEPLOY_SERVICE: 'DEPLOY_SERVICE',
    LIST_WORKERS: 'LIST_WORKERS',
    LIST_TASKS: 'LIST_TASKS',
    TOGGLE_DASHBOARD: 'TOGGLE_DASHBOARD',
    SET_TASK_METADATA: 'SET_TASK_METADATA'
}

///
// Reducer function for `useReducer`

const reducer = (state, action) => {
  console.log("cyborg action: ", action)
  console.log("cyborg state: ", state)
  switch (action.type) {
    case ACTIONS.SELECT_PROVIDER:
      return { ...state, selectedPath: 'PROVIDER' }
    case ACTIONS.SELECT_ACCESSOR:
      return { ...state, selectedPath: 'ACCESSOR' }
    case ACTIONS.TOGGLE_DEV_MODE:
      return { ...state, devMode: action.payload }
    case ACTIONS.RESET_PATH:
    return { ...state, devMode: null }
    case ACTIONS.SELECT_SERVICE:
      return { ...state, service: action.payload }
    case ACTIONS.DEPLOY_SERVICE:
      return { ...state, serviceStatus: action.payload }
    case ACTIONS.LIST_WORKERS:
      return { ...state, workerList: action.payload }
    case ACTIONS.LIST_TASKS:
      return { ...state, taskList: action.payload }
    case ACTIONS.TOGGLE_DASHBOARD:
      return { ...state, dashboard: action.payload }
    case ACTIONS.SET_TASK_METADATA:
      return { ...state, taskMetadata: action.payload }
    default:
      throw new Error(`Unknown type: ${action.type}`)
  }
}

const CyborgContext = React.createContext()


const CyborgContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, workerTxContract, taskTxContract } = useContext(WalletContext)
  const [event, setEvents] = useState()

    const { devMode } = state

    useEffect(() => {  
      const getEvents = async (txContract, eventName) => {
        try {
          const eventTopic = txContract.interface.getEventTopic(eventName);
          const filter = {
            address: txContract.address,
            topics: [eventTopic],
          };
          try {
            const logs = await provider.getLogs(filter);
            console.log("logs: ", logs)
            const events = logs.map(log => txContract.interface.parseLog(log));
            console.log('Past events:', events);
            setEvents(events);
          } catch (error) {
            console.error('Error fetching past events:', error);
          }
        } catch (e) {
          console.error("getEvents error: ", e)
        }
      }
      if (workerTxContract && !event) {
        getEvents(workerTxContract, EVENTS.WORKER.WorkerRegistered)
      }
    }, [provider, workerTxContract, event]);
  

    useEffect(()=>{
      async function getRegisteredWorkers() {
        console.log("getting workers")
        let workers = [];
        try {
          const count = await workerTxContract.getWorkerCount()
          for (let i = 0; i < count.toNumber(); i++) {
            const details = await workerTxContract.getWorkerDetails(i)
            const worker = {
              address:details[0],
              memoryInfo:details[1],
              cpuCores:details[2],
              storageInfo:details[3],
              isActive:details[4]
            }
            console.log("worker: ", worker)
            workers.push(worker) 
          }
          listWorkers(workers)
        } catch (e) {
          console.error("failed getting worker info: ", e)
        }
      }
      if (workerTxContract) getRegisteredWorkers()
    }, [workerTxContract])

    useEffect(()=>{
      async function getScheduledTasks() {
        console.log("getting tasks")
        let tasks = [];
        try {
          const count = await taskTxContract.taskCounter()
          for (let i = 0; i < count.toNumber(); i++) {
            const details = await taskTxContract.tasks(i)
            const task = {
              taskId: i,
              workerAddress:details[0],
              creator:details[1],
              status:details[2],
              dockerImage:details[3],
            }
            console.log("task: ", task)
            tasks.push(task) 
          }
          listTasks(tasks)
        } catch (e) {
          console.error("failed getting task info: ", e)
        }
      }
      if (taskTxContract) getScheduledTasks()
    }, [taskTxContract])

    const toggleDevMode = () => {
        dispatch({ type: ACTIONS.TOGGLE_DEV_MODE, payload: !devMode })
    }

    const provideCompute = () => {
        dispatch({ type: ACTIONS.SELECT_PROVIDER })
    }

    const accessCompute = () => {
        dispatch({ type: ACTIONS.SELECT_ACCESSOR })
    }

    const resetPath = () => {
        dispatch({ type: ACTIONS.RESET_PATH })
    }

    const selectService = (service) => {
      dispatch({ type: ACTIONS.SELECT_SERVICE, payload: service })
    }

    const setTaskStatus = (deployTask) => {
      dispatch({ type: ACTIONS.DEPLOY_SERVICE, payload: { ...state.serviceStatus, deployTask } })
    }

    const setTaskMetadata = (taskEvent) => {
      console.log("set task metadata: ", taskEvent)
      const taskMetadata = {
        dockerImage: taskEvent.dockerImage,
        status: taskEvent.status,
        taskId: taskEvent.taskId,
        workerAddress: taskEvent.workerAddress,
        executorIp: 'hidden'
      }

      console.log("task metadata: ", taskMetadata)
      dispatch({ type: ACTIONS.SET_TASK_METADATA, payload: taskMetadata })
    }

    const setDeployComputeStatus = (deployCompute) => {
      dispatch({ type: ACTIONS.DEPLOY_SERVICE, payload: { ...state.serviceStatus, deployCompute } })
    }

    const listWorkers = (list) => {
      dispatch({ type: ACTIONS.LIST_WORKERS, payload: list})
    }

    const listTasks = (list) => {
      dispatch({ type: ACTIONS.LIST_TASKS, payload: list})
    }

    const toggleDashboard = ({section = null, metadata = null}) => {
      const dashInfo = {
        ...state.dashboard,
        ...(section && { section }), 
        ...(metadata && { metadata }), 
      };
      dispatch({ type: ACTIONS.TOGGLE_DASHBOARD, payload: dashInfo})
    }

  return (
    <CyborgContext.Provider value={{ state, resetPath, toggleDevMode, toggleDashboard, provideCompute, accessCompute, selectService, setTaskStatus, setTaskMetadata, setDeployComputeStatus, listWorkers }}>
      {children}
    </CyborgContext.Provider>
  )
}

const useCyborg = () => useContext(CyborgContext)
const useCyborgState = () => useContext(CyborgContext).state

export { CyborgContextProvider, useCyborg, useCyborgState }
