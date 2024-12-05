import React, {useEffect, useState} from 'react';
import LoginPage from './LoginPage';  

function App() {
  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    console.log("Fetching from /api...")
    fetch("/api").then(
      response => response.json()
    ).then(
      data => {
        console.log("Data fetched: ", data)
        setBackendData(data);
      }
    )
    .catch(error => console.log("Error fetching data:", error))
  }, [])

  return (
    <div>
      <LoginPage /> 
    </div>
  );
}

export default App;
