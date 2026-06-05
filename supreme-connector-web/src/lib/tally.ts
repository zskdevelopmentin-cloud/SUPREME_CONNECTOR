const COMPANIES_XML = `
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

const LEDGERS_XML = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Ledgers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>
`;

const STOCK_ITEMS_XML = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Stock Summary</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>
`;

export async function sendTallyRequest(host: string, port: string, xml: string): Promise<string> {
  const url = `http://${host}:${port}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: xml,
    // Add brief timeout config if supported by fetch
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`Tally responded with status: ${response.status}`);
  }

  return response.text();
}

export async function testTallyConnection(host: string, port: string): Promise<boolean> {
  try {
    const text = await sendTallyRequest(host, port, COMPANIES_XML);
    return text.includes("ENVELOPE");
  } catch (error) {
    console.error("testTallyConnection error:", error);
    return false;
  }
}

export interface TallySyncResult {
  companies: string[];
  ledgers: { name: string; parent: string; balance: number }[];
  stockItems: { name: string; unit: string; stock: number }[];
}

export async function fetchTallyData(host: string, port: string): Promise<TallySyncResult> {
  // 1. Fetch Companies
  const companiesText = await sendTallyRequest(host, port, COMPANIES_XML);
  const compDoc = new DOMParser().parseFromString(companiesText, "text/xml");
  const companyNames: string[] = [];
  
  const companyNameTags = compDoc.getElementsByTagName("COMPANYNAME");
  for (let i = 0; i < companyNameTags.length; i++) {
    const val = companyNameTags[i].textContent;
    if (val) companyNames.push(val);
  }
  if (companyNames.length === 0) {
    const nameTags = compDoc.getElementsByTagName("NAME");
    for (let i = 0; i < nameTags.length; i++) {
      const val = nameTags[i].textContent;
      if (val) companyNames.push(val);
    }
  }

  // 2. Fetch Ledgers
  const ledgersText = await sendTallyRequest(host, port, LEDGERS_XML);
  const ledgerDoc = new DOMParser().parseFromString(ledgersText, "text/xml");
  const ledgers: { name: string; parent: string; balance: number }[] = [];

  const ledgerTags = ledgerDoc.getElementsByTagName("LEDGER");
  for (let i = 0; i < ledgerTags.length; i++) {
    const el = ledgerTags[i];
    const name = el.getElementsByTagName("NAME")[0]?.textContent || el.getAttribute("NAME") || "Unknown";
    const parent = el.getElementsByTagName("PARENT")[0]?.textContent || "Unknown";
    const balanceStr = el.getElementsByTagName("CLOSINGBALANCE")[0]?.textContent || "0";
    // Tally balance is often represented as Debit/Credit or trailing letters, let's parse float
    const balance = parseFloat(balanceStr.replace(/[^\d.-]/g, "")) || 0;
    ledgers.push({ name, parent, balance });
  }

  // Fallback for simple elements
  if (ledgers.length === 0) {
    const ledgerNameTags = ledgerDoc.getElementsByTagName("LEDGERNAME");
    for (let i = 0; i < ledgerNameTags.length; i++) {
      const name = ledgerNameTags[i].textContent || "Unknown";
      ledgers.push({ name, parent: "Unknown", balance: 0 });
    }
  }

  // 3. Fetch Stock Items
  const stockText = await sendTallyRequest(host, port, STOCK_ITEMS_XML);
  const stockDoc = new DOMParser().parseFromString(stockText, "text/xml");
  const stockItems: { name: string; unit: string; stock: number }[] = [];

  const itemTags = stockDoc.getElementsByTagName("STOCKITEM");
  for (let i = 0; i < itemTags.length; i++) {
    const el = itemTags[i];
    const name = el.getElementsByTagName("NAME")[0]?.textContent || el.getAttribute("NAME") || "Unknown";
    const unit = el.getElementsByTagName("BASEUNITS")[0]?.textContent || "Nos";
    const stockStr = el.getElementsByTagName("CLOSINGBALANCE")[0]?.textContent || "0";
    const stock = parseFloat(stockStr.replace(/[^\d.-]/g, "")) || 0;
    stockItems.push({ name, unit, stock });
  }

  return {
    companies: companyNames,
    ledgers,
    stockItems,
  };
}
