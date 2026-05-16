const axios = require('axios');
const xml2js = require('xml2js');

class TallyClient {
  constructor(host = 'localhost', port = 9000) {
    this.url = `http://${host}:${port}`;
  }

  async sendRequest(xml) {
    try {
      const response = await axios.post(this.url, xml, {
        headers: { 'Content-Type': 'text/xml' }
      });
      const parser = new xml2js.Parser({ explicitArray: false });
      return await parser.parseStringPromise(response.data);
    } catch (error) {
      console.error('Tally Connection Error:', error.message);
      throw new Error('Tally is not running or port 9000 is blocked.');
    }
  }

  async getCompanies() {
    const xml = `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>List of Companies</REPORTNAME>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
    return this.sendRequest(xml);
  }

  async getStockItems() {
    // Standard Tally XML for fetching stock items
    const xml = `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
              <REPORTNAME>Stock Summary</REPORTNAME>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
    return this.sendRequest(xml);
  }
}

module.exports = TallyClient;
