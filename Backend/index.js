// server.js

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'anuuuu',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));


app.post('/saveData', (req, res) => {
  const data = req.body;

  const query = 'INSERT INTO cve_data SET ?';

  connection.query(query, data, (error, results, fields) => {
    if (error) {
      console.error('Error saving data to MySQL:', error);
      res.status(500).json({ error: 'Error saving data to MySQL' });
      return;
    }
    console.log('Data saved to MySQL successfully');
    res.status(200).json({ message: 'Data saved to MySQL successfully' });
  });
});

app.get('/getData', (req, res) => {
    const query = `SELECT 
    cve_data.id,
    cve_data.sourceIdentifier,
    cve_data.published,
    cve_data.lastModified,
    cve_data.vulnStatus,
    cve_data.descriptions,
    cve_data.vectorString,
    cve_data.baseSeverity,
    cve_data.baseScore,
    cve_data.accessVector,
    cve_data.accessComplexity,
    cve_data.authentication,
    cve_data.confidentialityImpact,
    cve_data.integrityImpact,
    cve_data.availabilityImpact,
    cve_data.exploitabilityScore,
    cve_data.impactScore,
    cve_data.vulnerable,
    cve_data.criteria,
    cve_data.matchCriteriaId
  FROM anuuuu.cve_data`;
  
    connection.query(query, (error, results, fields) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).json({ error: 'Error fetching data from MySQL' });
        return;
      }
      res.json(results);
    });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
