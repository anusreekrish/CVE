import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [cveData, setCveData] = useState(null);
  const [myData, setMyData] = useState([]);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://services.nvd.nist.gov/rest/json/cves/2.0');
        const data = await response.json();
        setCveData(data);

        // Extract and send data to backend
        extractAndSendData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const extractAndSendData = async (data) => {
    if (data && data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
      const filteredVulnerabilities = data.vulnerabilities.filter(vulnerability => vulnerability !== null);
      filteredVulnerabilities.forEach(vulnerability => {
        const {
          cve: {
            id,
            sourceIdentifier,
            published,
            lastModified,
            vulnStatus,
            descriptions,
            metrics: {
              cvssMetricV2: [
                {
                  cvssData: {
                    vectorString,
                    baseSeverity,
                    baseScore,
                    accessVector,
                    accessComplexity,
                    authentication,
                    confidentialityImpact,
                    integrityImpact,
                    availabilityImpact,
                  },
                  exploitabilityScore,
                  impactScore,
                },
              ],
            },
            configurations,
          },
        } = vulnerability;

        configurations.forEach(configuration => {
          configuration.nodes.forEach(node => {
            node.cpeMatch.forEach(cpeMatch => {
              const { vulnerable, criteria, matchCriteriaId } = cpeMatch;
              const sendData = {
                id,
                sourceIdentifier,
                published,
                lastModified,
                vulnStatus,
                descriptions,
                vectorString,
                baseSeverity,
                baseScore,
                accessVector,
                accessComplexity,
                authentication,
                confidentialityImpact,
                integrityImpact,
                availabilityImpact,
                exploitabilityScore,
                impactScore,
                vulnerable,
                criteria,
                matchCriteriaId,
              };
              sendDataToBackend(sendData);
            });
          });
        });
      });
    }
  };

  const sendDataToBackend = async (data) => {
    try {
      await axios.post('http://localhost:5000/saveData', data);
      console.log('Data sent to backend successfully');
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getData'); // Assuming getData is your endpoint to fetch data from MySQL
        setMyData(response.data);
        console.log(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [resultsPerPage]);

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing results per page
  };

  const totalPages = Math.ceil(myData.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentPageData = myData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>CVE ID</th>
            <th>Identifier</th>
            <th>Published Date</th>
            <th>Last Modified Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.sourceIdentifier}</td>
              <td>{item.published}</td>
              <td>{item.lastModified}</td>
              <td>{item.vulnStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div className="results-per-page">
        <label htmlFor="resultsPerPage">Results Per Page:</label>
        <select id="resultsPerPage" value={resultsPerPage} onChange={handleResultsPerPageChange}>
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
}


export default App;
