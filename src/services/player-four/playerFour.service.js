import axios from 'axios'; 
import authHeader from "../authHeader.js"; 

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL; 
const API_URL = baseUrl + "playerFour/";

class PlayerFourService { 
  getAllRecords = () => axios.get(API_URL, { headers: authHeader() }); 

  getRecordById = (id) => axios.get(API_URL + `${id}/`, { headers: authHeader() }); 

addRecord = (data) => axios.post(API_URL, data, { headers: authHeader() }); 

updateRecord = (data) => axios.put(API_URL + `${data.id}/`, data, { headers: authHeader() }).then((r) => r.data);

deleteRecord = (id) => axios.delete(API_URL + `${id}`, { headers: authHeader() }).then((r) => r.data);




} 

export default new PlayerFourService();