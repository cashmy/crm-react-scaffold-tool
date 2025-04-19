import axios from "axios";
import authHeader from "../authHeader";

const baseUrl = process.env.BASE_API_URL;
const API_URL = baseUrl + "playerOne/";

class PlayerOneService {
  getAllRecords = () =>
    axios.get(API_URL, {
      headers: authHeader()
    });

  getRecordById = (id) =>
    axios.get(API_URL + `${id}/`, {
      headers: authHeader()
    });

  addRecord = (data) =>
    axios.post(API_URL, data, {
      headers: authHeader()
    });

  updateRecord = (data) =>
    axios
      .put(API_URL + `${data.id}/`, data, {
        headers: authHeader()
      })
      .then((response) => response.data);

  deleteRecord = (id) =>
    axios
      .delete(API_URL + `${id}`, {
        headers: authHeader()
      })
      .then((response) => response.data);
}

export default new PlayerOneService();
