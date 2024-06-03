import {useContext, useState} from 'react'
import { Dimmer } from 'semantic-ui-react'
import { SERVICES, DEPLOY_STATUS, useCyborg } from '../../../../dapp-context/CyborgContext'
import { WalletContext } from '../../../../dapp-context/Web3Connect'
import toast from 'react-hot-toast';

function UploadDockerImgURL({setService}) {
  const { taskTxContract } = useContext(WalletContext)
  const { selectService, setTaskStatus } = useCyborg()
  const [url,setUrl] = useState('')

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    selectService(SERVICES.CYBER_DOCK)
    setTaskStatus(DEPLOY_STATUS.PENDING)
    console.log("url: ", url)
    try {
      const tx = await taskTxContract.scheduleTask(url); 
      console.log('Transaction sent:', tx);
      toast.success('Transaction sent:', tx);
      const receipt = await tx.wait();
      console.log('Transaction mined:', receipt);
    } catch (error) {
      console.error('Error writing contract data:', error);
      toast.error('Error writing contract data:', error);
      setTaskStatus(DEPLOY_STATUS.FAILED)
    }
  }
  
  return (
      <Dimmer active >
          
          <form onSubmit={handleSubmit}  className="bg-cb-gray-700 rounded-lg p-20">
            <h5 className='flex'>Upload Docker Image</h5>
            <div className="mb-4">
              <label htmlFor="url" className="flex text-white text-sm font-bold py-4 mb-2">Docker image URL</label>
              <input type="text" id="url" name="url" onChange={handleUrlChange} className="focus:border-cb-green text-cb-gray-600 border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className=" flex items-center justify-between">
                <button onClick={()=>setService(null)}
                  className="bg-cb-gray-600 w-full hover:ring-2 ring-cb-gray-500 text-white py-2 rounded">Close</button>
              </div>
              <div className=" flex items-center justify-between">
                <button type="submit" 
                  className="bg-cb-green w-full hover:ring-2 ring-white  text-black py-2 rounded">Submit</button>
              </div>
            </div>
          </form>

      </Dimmer>
  )
}

export default UploadDockerImgURL