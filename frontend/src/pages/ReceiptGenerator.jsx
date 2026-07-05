import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  X, 
  Eye, 
  Check, 
  Loader2, 
  Building2, 
  Sparkles, 
  Download, 
  Info,
  CreditCard,
  Percent
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import api from '../services/api';

const ReceiptGenerator = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [startInvoice, setStartInvoice] = useState('101');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(18);

  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [sealDataUrl, setSealDataUrl] = useState(null);
  const [sigDataUrl, setSigDataUrl] = useState(null);
  const [signerName, setSignerName] = useState('');

  const [logoName, setLogoName] = useState('');
  const [sealName, setSealName] = useState('');
  const [sigName, setSigName] = useState('');

  // File Upload State
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const initData = async () => {
      try {
        const compsRes = await api.get('/company/list');
        setCompanies(compsRes.data);
        const assetsRes = await api.get('/company/all-assets');
        setAvailableAssets(assetsRes.data);
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleCompanyChange = async (e) => {
    const id = e.target.value;
    setSelectedCompanyId(id);
    if (!id) {
      // Reset form fields
      setCompanyName('');
      setCompanyGstin('');
      setCompanyPhone('');
      setCompanyEmail('');
      setCompanyAddress('');
      setBankName('');
      setBankBranch('');
      setBankAccount('');
      setBankIfsc('');
      setSignerName('');
      setLogoDataUrl(null);
      setSealDataUrl(null);
      setSigDataUrl(null);
      setLogoName('');
      setSealName('');
      setSigName('');
      return;
    }

    const comp = companies.find(c => c.id === parseInt(id));
    if (!comp) return;

    setCompanyName(comp.company_name || '');
    setCompanyGstin(comp.gstin || '');
    setCompanyPhone(comp.phone_number || '');
    setCompanyEmail(comp.email || '');
    
    const addressParts = [
      comp.address_line1,
      comp.address_line2,
      comp.city,
      comp.state ? (comp.pincode ? `${comp.state} - ${comp.pincode}` : comp.state) : comp.pincode
    ].filter(Boolean);
    setCompanyAddress(addressParts.join(', '));

    setBankName(comp.bank_name || '');
    setBankBranch(comp.bank_branch || '');
    setBankAccount(comp.bank_account_no || '');
    setBankIfsc(comp.bank_ifsc || '');
    setSignerName(comp.signer_name || '');

    // Reset image states first
    setLogoDataUrl(null);
    setSealDataUrl(null);
    setSigDataUrl(null);
    setLogoName('');
    setSealName('');
    setSigName('');

    // Fetch and load image assets
    const compAssets = availableAssets.filter(a => a.company_code === comp.company_code);
    
    const logoAsset = compAssets.find(a => a.asset_type === 'logo');
    if (logoAsset) {
      setLogoName(logoAsset.asset_name);
      const dataUrl = await fetchAssetAsDataUrl(logoAsset.asset_url);
      if (dataUrl) setLogoDataUrl(dataUrl);
    }

    const sealAsset = compAssets.find(a => a.asset_type === 'seal');
    if (sealAsset) {
      setSealName(sealAsset.asset_name);
      const dataUrl = await fetchAssetAsDataUrl(sealAsset.asset_url);
      if (dataUrl) setSealDataUrl(dataUrl);
    }

    const sigAsset = compAssets.find(a => a.asset_type === 'signature');
    if (sigAsset) {
      setSigName(sigAsset.asset_name);
      const dataUrl = await fetchAssetAsDataUrl(sigAsset.asset_url);
      if (dataUrl) setSigDataUrl(dataUrl);
    }
  };

  const fetchAssetAsDataUrl = async (url) => {
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(response.data);
      });
    } catch (e) {
      console.error("Failed to load asset from: " + url, e);
      return null;
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      if (type === 'logo') {
        setLogoDataUrl(dataUrl);
        setLogoName(file.name);
      } else if (type === 'seal') {
        setSealDataUrl(dataUrl);
        setSealName(file.name);
      } else if (type === 'signature') {
        setSigDataUrl(dataUrl);
        setSigName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      processFile(droppedFile);
    } else {
      setError('Please drop a valid Excel or CSV file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setRows([]);
    setStatusMsg({ text: '', type: '' });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!json.length) {
          throw new Error('The file has no data rows.');
        }

        const normalizeKey = (k) => String(k).trim().toLowerCase();
        const headerMap = {};
        Object.keys(json[0]).forEach(k => headerMap[normalizeKey(k)] = k);

        const findCol = (candidates) => {
          for (const c of candidates) {
            if (headerMap[c] !== undefined) return headerMap[c];
          }
          return null;
        };

        const dateKey   = findCol(['date', 'transaction date', 'txn date']);
        const nameKey   = findCol(['name', 'customer', 'customer name', 'client', 'client name']);
        const amountKey = findCol(['amount', 'amt', 'total', 'value']);
        const purposeKey= findCol(['purpose', 'item', 'description', 'item/description', 'particulars']);

        const missing = [];
        if (!dateKey) missing.push('date');
        if (!nameKey) missing.push('name');
        if (!amountKey) missing.push('amount');
        if (!purposeKey) missing.push('purpose/description');

        if (missing.length) {
          throw new Error(`Could not find column(s): ${missing.join(', ')}.`);
        }

        const parseDateValue = (v) => {
          if (v instanceof Date) return v;
          if (typeof v === 'number') {
            const d = XLSX.SSF.parse_date_code(v);
            if (d) return new Date(d.y, d.m - 1, d.d);
          }
          if (typeof v === 'string') {
            const d = new Date(v);
            if (!isNaN(d.getTime())) return d;
          }
          return null;
        };

        const parsedRows = json.map((r, i) => {
          const rawDate = r[dateKey];
          const parsedDate = parseDateValue(rawDate);
          const amountNum = parseFloat(String(r[amountKey]).replace(/[^0-9.\-]/g, ''));
          return {
            rowNum: i + 1,
            dateRaw: rawDate,
            date: parsedDate,
            dateDisplay: parsedDate ? parsedDate.toLocaleDateString('en-GB') : String(rawDate),
            name: String(r[nameKey] ?? '').trim(),
            amount: isNaN(amountNum) ? 0 : amountNum,
            purpose: String(r[purposeKey] ?? '').trim()
          };
        }).filter(r => r.name || r.amount || r.purpose);

        if (!parsedRows.length) {
          throw new Error('No valid transaction rows found after parsing.');
        }

        setRows(parsedRows);
        setStatusMsg({ text: `Loaded ${parsedRows.length} transactions successfully.`, type: 'ok' });
      } catch (err) {
        setError(err.message);
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const sampleData = [
      { Date: '01-06-2026', Name: 'Ramesh Kumar', Amount: 5000, Purpose: 'Consulting fee for May' },
      { Date: '05-06-2026', Name: 'Priya Sharma', Amount: 12500.50, Purpose: 'Web design project' },
      { Date: '10-06-2026', Name: 'Anil Traders', Amount: 800, Purpose: 'Office supplies' }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 12 }, { wch: 32 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'transaction_template.xlsx');
  };

  const removeFile = () => {
    setFile(null);
    setRows([]);
    setError('');
    setStatusMsg({ text: '', type: '' });
  };

  const parseStartInvoice = (val) => {
    val = String(val).trim();
    const match = val.match(/^([A-Za-z\-]*)(\d+)$/);
    if (match) {
      return { prefix: match[1] || 'INV-', num: parseInt(match[2], 10), padLen: match[2].length };
    }
    const n = parseInt(val, 10);
    return { prefix: 'INV-', num: isNaN(n) ? 1 : n, padLen: String(isNaN(n) ? 1 : n).length };
  };

  const formatInvoiceNumber = (base, offset) => {
    const num = base.num + offset;
    let numStr = String(num);
    if (base.padLen > numStr.length) numStr = numStr.padStart(base.padLen, '0');
    return base.prefix + numStr;
  };

  const fmtMoney = (n) => {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const numberToWordsIndian = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function twoDigits(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    function threeDigits(n) {
      if (n < 100) return twoDigits(n);
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '');
    }

    if (num === 0) return 'Zero';

    let rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    const crore = Math.floor(rupees / 10000000); rupees %= 10000000;
    const lakh = Math.floor(rupees / 100000); rupees %= 100000;
    const thousand = Math.floor(rupees / 1000); rupees %= 1000;
    const hundred = rupees;

    let parts = [];
    if (crore) parts.push(threeDigits(crore) + ' Crore');
    if (lakh) parts.push(threeDigits(lakh) + ' Lakh');
    if (thousand) parts.push(threeDigits(thousand) + ' Thousand');
    if (hundred) parts.push(threeDigits(hundred));

    let result = parts.join(', ') + (rupees === 1 && crore === 0 && lakh === 0 && thousand === 0 ? ' Rupee' : ' Rupees');
    if (paise > 0) {
      result += ' and ' + twoDigits(paise) + ' Paise';
    }
    return result + ' Only';
  };

  const getImageFormat = (dataUrl) => {
    if (!dataUrl) return 'PNG';
    if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
    return 'PNG';
  };

  const handleGenerate = () => {
    if (!rows.length) return;
    setGenerating(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const startInvoiceRaw = startInvoice.trim() || '101';
      const invBase = parseStartInvoice(startInvoiceRaw);

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 46;
      const contentW = pageW - marginX * 2;
      const todayStr = new Date().toLocaleDateString('en-GB');

      rows.forEach((row, idx) => {
        if (idx > 0) doc.addPage();

        const invoiceNo = formatInvoiceNumber(invBase, idx);
        let y = 50;

        // ---- Top strip ----
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(40, 84, 158);
        doc.text('TAX INVOICE', marginX, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(120, 124, 116);
        doc.text('ORIGINAL FOR RECIPIENT', pageW - marginX, y, { align: 'right' });
        y += 18;

        doc.setDrawColor(216, 211, 198);
        doc.setLineWidth(0.75);
        doc.line(marginX, y, pageW - marginX, y);
        y += 22;

        // ---- Company header (left) + logo (right) ----
        const headerTopY = y;
        const logoReserve = logoDataUrl ? 78 : 0;
        const nameMaxW = contentW - logoReserve;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(28, 37, 33);
        const nameLines = doc.splitTextToSize(companyName || 'Your Company Name', nameMaxW);
        doc.text(nameLines, marginX, y);
        y += nameLines.length * 16;

        if (companyGstin) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(90, 95, 87);
          doc.text('GSTIN ' + companyGstin, marginX, y);
          y += 13;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(90, 95, 87);
        if (companyAddress) {
          const addrLines = doc.splitTextToSize(companyAddress, nameMaxW);
          doc.text(addrLines, marginX, y);
          y += addrLines.length * 11.5;
        }
        let contactLine = [];
        if (companyPhone) contactLine.push('Mobile ' + companyPhone);
        if (companyEmail) contactLine.push('Email ' + companyEmail);
        if (contactLine.length) {
          doc.text(contactLine.join('   '), marginX, y);
          y += 13;
        }

        // Logo
        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, getImageFormat(logoDataUrl), pageW - marginX - 64, headerTopY - 8, 64, 64, undefined, 'FAST');
          } catch (e) {
            console.error("Could not render logo in PDF: ", e);
          }
        }

        y += 14;

        // ---- Invoice # / Date row ----
        doc.setDrawColor(216, 211, 198);
        doc.setLineWidth(0.6);
        doc.line(marginX, y, pageW - marginX, y);
        y += 18;

        const col2X = marginX + contentW * 0.36;
        const col3X = marginX + contentW * 0.68;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(90, 95, 87);
        doc.text('Invoice #:', marginX, y);
        doc.text('Invoice Date:', col2X, y);
        doc.text('Due Date:', col3X, y);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(28, 37, 33);
        doc.text(invoiceNo, marginX + 52, y);
        doc.text(row.dateDisplay, col2X + 68, y);
        doc.text(row.dateDisplay, col3X + 56, y);
        y += 22;

        doc.setDrawColor(216, 211, 198);
        doc.setLineWidth(0.6);
        doc.line(marginX, y, pageW - marginX, y);
        y += 20;

        // ---- Customer details ----
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(90, 95, 87);
        doc.text('Customer Details:', marginX, y);
        y += 14;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(28, 37, 33);
        doc.text(row.name || '—', marginX, y);

        if (placeOfSupply) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(90, 95, 87);
          doc.text('Place of Supply:', col3X, y - 14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(28, 37, 33);
          doc.text(placeOfSupply, col3X, y);
        }
        y += 26;

        // ---- Line item table ----
        const taxColsOn = taxEnabled;
        const c_no = marginX;
        const c_item = marginX + contentW * 0.04;
        const c_rate = marginX + contentW * (taxColsOn ? 0.38 : 0.46);
        const c_qty = marginX + contentW * (taxColsOn ? 0.50 : 0.60);
        const c_taxable = marginX + contentW * (taxColsOn ? 0.58 : 0);
        const c_taxamt = marginX + contentW * (taxColsOn ? 0.76 : 0);
        const c_amount = pageW - marginX;

        doc.setFillColor(231, 238, 233);
        doc.rect(marginX, y, contentW, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(47, 93, 79);
        doc.text('#', c_no + 4, y + 14);
        doc.text('ITEM', c_item, y + 14);
        doc.text('RATE / ITEM', c_rate, y + 14);
        doc.text('QTY', c_qty, y + 14);
        if (taxColsOn) {
          doc.text('TAXABLE VALUE', c_taxable, y + 14);
          doc.text('TAX AMOUNT', c_taxamt, y + 14);
        }
        doc.text('AMOUNT', c_amount, y + 14, { align: 'right' });
        y += 22;

        const total = row.amount;
        let taxableValue = total;
        let taxAmt = 0;
        let cgstAmt = 0, sgstAmt = 0;
        if (taxEnabled) {
          taxableValue = total / (1 + taxRate / 100);
          taxAmt = total - taxableValue;
          cgstAmt = taxAmt / 2;
          sgstAmt = taxAmt / 2;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(28, 37, 33);
        const itemLines = doc.splitTextToSize(row.purpose || '—', (taxColsOn ? contentW * 0.32 : contentW * 0.42));
        doc.text(itemLines, c_item, y + 14);
        doc.text(fmtMoney(taxableValue), c_rate, y + 14);
        doc.text('1', c_qty, y + 14);
        if (taxColsOn) {
          doc.setFontSize(8.5);
          doc.text(fmtMoney(taxableValue), c_taxable, y + 14);
          doc.text(fmtMoney(taxAmt), c_taxamt, y + 14);
          doc.setFontSize(7);
          doc.setTextColor(120, 124, 116);
          doc.text(`(${taxRate}%)`, c_taxamt, y + 24);
          doc.setFontSize(9.5);
          doc.setTextColor(28, 37, 33);
        }
        doc.text(fmtMoney(total), c_amount, y + 14, { align: 'right' });
        const itemRowH = Math.max(34, itemLines.length * 12 + 20);
        y += itemRowH;

        doc.setDrawColor(216, 211, 198);
        doc.setLineWidth(0.5);
        doc.line(marginX, y, pageW - marginX, y);
        y += 18;

        // ---- Totals ----
        const totalsLabelX = pageW - marginX - 190;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(28, 37, 33);
        doc.text('Taxable Amount', totalsLabelX, y);
        doc.text('Rs. ' + fmtMoney(taxableValue), pageW - marginX, y, { align: 'right' });
        y += 15;

        if (taxEnabled) {
          doc.text(`CGST ${taxRate / 2}%`, totalsLabelX, y);
          doc.text('Rs. ' + fmtMoney(cgstAmt), pageW - marginX, y, { align: 'right' });
          y += 15;
          doc.text(`SGST ${taxRate / 2}%`, totalsLabelX, y);
          doc.text('Rs. ' + fmtMoney(sgstAmt), pageW - marginX, y, { align: 'right' });
          y += 15;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(28, 37, 33);
        doc.text('Total', totalsLabelX, y + 4);
        doc.text('Rs. ' + fmtMoney(total), pageW - marginX, y + 4, { align: 'right' });
        y += 26;

        // ---- Words, limits ----
        doc.setDrawColor(216, 211, 198);
        doc.setLineWidth(0.5);
        doc.line(marginX, y, pageW - marginX, y);
        y += 14;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 95, 87);
        doc.text('Total Items / Qty : 1 / 1', marginX, y);
        const wordsLabel = 'Total amount (in words): INR ' + numberToWordsIndian(total) + '.';
        const wordsLines = doc.splitTextToSize(wordsLabel, contentW * 0.62);
        doc.text(wordsLines, pageW - marginX, y, { align: 'right' });
        y += Math.max(14, wordsLines.length * 11 + 4);

        // ---- HSN/SAC table ----
        if (taxEnabled) {
          y += 6;
          const hCols = {
            hsn: marginX,
            taxable: marginX + contentW * 0.30,
            cRate: marginX + contentW * 0.46,
            cAmt: marginX + contentW * 0.56,
            sRate: marginX + contentW * 0.70,
            sAmt: marginX + contentW * 0.80,
            totTax: marginX + contentW * 0.90
          };
          doc.setDrawColor(168, 161, 147);
          doc.setLineWidth(0.6);
          doc.rect(marginX, y, contentW, 40);
          doc.line(hCols.taxable, y, hCols.taxable, y + 40);
          doc.line(hCols.cRate, y, hCols.cRate, y + 40);
          doc.line(hCols.sRate, y, hCols.sRate, y + 20);
          doc.line(hCols.totTax, y, hCols.totTax, y + 40);
          doc.line(marginX, y + 20, pageW - marginX, y + 20);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.8);
          doc.setTextColor(47, 93, 79);
          doc.text('HSN/SAC', hCols.hsn + 4, y + 13);
          doc.text('TAXABLE VALUE', hCols.taxable + 4, y + 13);
          doc.text('CENTRAL TAX', hCols.cRate + 4, y + 13);
          doc.text('STATE/UT TAX', (hCols.sRate + hCols.totTax) / 2 - 18, y + 13);
          doc.text('TOTAL TAX', hCols.totTax + 4, y + 13);

          doc.setFontSize(7.3);
          doc.text('Rate', hCols.cRate + 4, y + 27);
          doc.text('Amount', hCols.cAmt + 4, y + 27);
          doc.text('Rate', hCols.sRate + 4, y + 27);
          doc.text('Amount', hCols.sAmt + 4, y + 27);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(28, 37, 33);
          doc.text('-', hCols.hsn + 4, y + 35);
          doc.text(fmtMoney(taxableValue), hCols.taxable + 4, y + 35);
          doc.text(taxRate / 2 + '%', hCols.cRate + 4, y + 35);
          doc.text(fmtMoney(cgstAmt), hCols.cAmt + 4, y + 35);
          doc.text(taxRate / 2 + '%', hCols.sRate + 4, y + 35);
          doc.text(fmtMoney(sgstAmt), hCols.sAmt + 4, y + 35);
          doc.text(fmtMoney(taxAmt), hCols.totTax + 4, y + 35);
          y += 40;

          const totalRowH = 22;
          doc.setDrawColor(168, 161, 147);
          doc.line(marginX, y, pageW - marginX, y);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(28, 37, 33);
          doc.text('TOTAL', hCols.taxable - 36, y + 14);
          doc.text(fmtMoney(taxableValue), hCols.taxable + 4, y + 14);
          doc.text(fmtMoney(cgstAmt), hCols.cAmt + 4, y + 14);
          doc.text(fmtMoney(sgstAmt), hCols.sAmt + 4, y + 14);
          doc.text(fmtMoney(taxAmt), hCols.totTax + 4, y + 14);
          doc.setDrawColor(168, 161, 147);
          doc.rect(marginX, y - 40, contentW, 40 + totalRowH);
          y += totalRowH + 18;
        }

        // ---- Amount payable ----
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(90, 95, 87);
        doc.text('Amount Payable:', pageW - marginX - 150, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(28, 37, 33);
        doc.text('Rs. ' + fmtMoney(total), pageW - marginX, y, { align: 'right' });
        y += 28;

        // ---- Bank details ----
        const hasBankDetails = bankName || bankAccount || bankIfsc || bankBranch;
        if (hasBankDetails) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(28, 37, 33);
          doc.text('Bank Details:', marginX, y);
          y += 14;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const bankRows = [
            ['Bank:', bankName],
            ['Account #:', bankAccount],
            ['IFSC Code:', bankIfsc],
            ['Branch:', bankBranch]
          ].filter(r => r[1]);
          bankRows.forEach(([lbl, val]) => {
            doc.setTextColor(90, 95, 87);
            doc.text(lbl, marginX, y);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(28, 37, 33);
            doc.text(val, marginX + 70, y);
            doc.setFont('helvetica', 'normal');
            y += 13;
          });
        }

        // ---- Footer seal & signature ----
        const footerY = pageH - 130;
        const sigBlockX = pageW - marginX - 170;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 95, 87);
        const forLines = doc.splitTextToSize('For ' + (companyName || 'Your Company Name'), 170);
        doc.text(forLines, sigBlockX, footerY - (forLines.length - 1) * 10);

        if (sealDataUrl) {
          try {
            doc.addImage(sealDataUrl, getImageFormat(sealDataUrl), marginX, footerY - 10, 68, 68, undefined, 'FAST');
          } catch (e) {
            console.error("Seal error: ", e);
          }
        }

        if (sigDataUrl) {
          try {
            doc.addImage(sigDataUrl, getImageFormat(sigDataUrl), sigBlockX, footerY + 8, 130, 42, undefined, 'FAST');
          } catch (e) {
            console.error("Signature error: ", e);
          }
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(28, 37, 33);
        if (signerName) {
          doc.text(signerName, sigBlockX, footerY + 64);
        }
        doc.setFontSize(8.5);
        doc.setTextColor(90, 95, 87);
        doc.text('Authorized Signatory', sigBlockX, footerY + 76);

        // ---- Page footer note ----
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 145);
        doc.text('Page 1 / 1  •  This is a computer generated document.', marginX, pageH - 26);
        doc.text(`${invoiceNo}  ·  Generated ${todayStr}`, pageW - marginX, pageH - 26, { align: 'right' });
      });

      const fname = `receipts_${invBase.prefix.replace(/[^A-Za-z0-9]/g,'')}${invBase.num}-${invBase.num + rows.length - 1}.pdf`;
      doc.save(fname);

      setStatusMsg({ text: `Done — ${rows.length} receipt(s) saved successfully as ${fname}`, type: 'ok' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: 'Something went wrong generating the PDF: ' + err.message, type: 'err' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
          Batch compilation
        </p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Excel → Receipts Generator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Upload a transaction list, fill in your company/bank details, and compile a single merged PDF with one receipt per transaction.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${
          statusMsg.type === 'ok' 
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' 
            : 'bg-red-950/20 border-red-800/40 text-red-400'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Configurations */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* STEP 1: TRANSACTION FILE */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <FileSpreadsheet className="h-4.5 w-4.5" />
              1 / Transaction File
            </h3>
            
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-semibold">Not sure of the format?</span>
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-900 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download Template
              </button>
            </div>

            {!file ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 group cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to choose file or drag it here
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Accepts .xlsx, .xls, or .csv with columns: date, name, amount, purpose
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB | {rows.length} rows parsed
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {file && rows.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  Preview (First 4 rows)
                </span>
                <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-[10px] whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-900/50">
                        <th className="p-2">Date</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Purpose</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                      {rows.slice(0, 4).map((row, idx) => (
                        <tr key={idx} className="text-slate-600 dark:text-slate-300">
                          <td className="p-2">{row.dateDisplay}</td>
                          <td className="p-2 font-bold">{row.name}</td>
                          <td className="p-2 truncate max-w-[150px]">{row.purpose}</td>
                          <td className="p-2 text-right font-mono font-semibold">{fmtMoney(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: COMPANY PROFILE & SELECTOR */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5" />
                2 / Company Profile
              </h3>
              
              {/* Optional Company Autoloader */}
              {companies.length > 0 && (
                <select
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <option value="">-- Autofill from Profiles --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="E.g. Riverstone Traders"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">GSTIN No.</label>
                <input
                  type="text"
                  value={companyGstin}
                  onChange={(e) => setCompanyGstin(e.target.value.toUpperCase())}
                  placeholder="E.g. 32AAHCE7860N1Z7"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="E.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="E.g. billing@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Starting Invoice Number</label>
                <input
                  type="text"
                  value={startInvoice}
                  onChange={(e) => setStartInvoice(e.target.value)}
                  placeholder="E.g. 101"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all font-mono font-bold text-brand-600 dark:text-brand-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Place of Supply</label>
                <input
                  type="text"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="E.g. 32-KERALA"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Address</label>
              <textarea
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                rows="2"
                placeholder="Street, city, state, PIN..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* STEP 2B: BANK DETAILS */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <CreditCard className="h-4.5 w-4.5" />
              2B / Bank Details (Optional)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="E.g. Union Bank of India"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Branch Name</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="E.g. Kothamangalam"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="E.g. 423001010038151"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  placeholder="E.g. UBIN0533769"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Tax & Assets upload */}
        <div className="flex flex-col gap-6">
          
          {/* STEP 3: TAX */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Percent className="h-4.5 w-4.5" />
              3 / GST Settings
            </h3>
            
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                  ${taxEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${taxEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Add GST line item split
              </span>
            </div>

            {taxEnabled && (
              <div className="flex flex-col gap-1.5 mt-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GST Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-brand-500 font-semibold font-mono"
                />
                <span className="text-[9px] text-slate-400 mt-1 font-medium leading-relaxed">
                  The uploaded Excel amounts will be treated as **tax-inclusive**. The compiler splits tax equally into CGST & SGST ({taxRate/2}% each).
                </span>
              </div>
            )}
          </div>

          {/* STEP 4: LOGO & SIGNATURES */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-5 shadow-sm">
            <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Sparkles className="h-4.5 w-4.5" />
              4 / Logo & Signatures
            </h3>
            
            {/* Logo upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Company Logo</span>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'logo')} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {logoDataUrl ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <img src={logoDataUrl} className="max-h-12 object-contain" alt="Logo preview" />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[180px]">{logoName}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-slate-400 group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-bold text-slate-500">Upload Logo image</span>
                  </>
                )}
              </div>
            </div>

            {/* Seal upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Company Seal</span>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'seal')} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {sealDataUrl ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <img src={sealDataUrl} className="max-h-12 object-contain" alt="Seal preview" />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[180px]">{sealName}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-slate-400 group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-bold text-slate-500">Upload Seal image</span>
                  </>
                )}
              </div>
            </div>

            {/* Signature upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Signature Image</span>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'signature')} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {sigDataUrl ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <img src={sigDataUrl} className="max-h-12 object-contain" alt="Signature preview" />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[180px]">{sigName}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-slate-400 group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-bold text-slate-500">Upload Signature image</span>
                  </>
                )}
              </div>
            </div>

            {/* Printed Signer Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Signed By (Name printed under signature)</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="E.g. A. Kumar"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Compilation Button */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm mt-2">
            <button
              onClick={handleGenerate}
              disabled={!file || generating || rows.length === 0}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 dark:disabled:bg-slate-800/80 text-xs font-semibold text-white disabled:text-slate-400 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:pointer-events-none"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : file ? (
                `Generate PDF (${rows.length} Receipts)`
              ) : (
                'Upload Excel file to compile'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
