import axios from "axios";
import { useState } from "react";

export const useRequest = ({ url, method, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const request = async (body = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { request, errors };
};
