<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $invoice->invoice_no }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 13px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 30px;
        }
        .header-table td {
            vertical-align: top;
        }
        .logo-container {
            max-height: 70px;
            max-width: 200px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .logo-img {
            max-height: 70px;
            max-width: 200px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }
        .company-details {
            color: #555;
            font-size: 12px;
            line-height: 1.5;
        }
        .invoice-title {
            font-size: 26px;
            font-weight: bold;
            color: #1e3a8a;
            text-align: right;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
        }
        .invoice-meta-table {
            width: auto;
            margin-left: auto;
            font-size: 12px;
        }
        .invoice-meta-table td {
            padding: 3px 5px;
        }
        .invoice-meta-label {
            font-weight: bold;
            color: #555;
            text-align: right;
            padding-right: 15px !important;
        }
        .invoice-meta-value {
            text-align: left;
        }
        .details-table {
            margin-bottom: 30px;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            padding: 15px 0;
        }
        .details-table td {
            vertical-align: top;
            width: 50%;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .bill-to-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .bill-to-details {
            color: #555;
            font-size: 12px;
            line-height: 1.4;
        }
        .item-table {
            margin-bottom: 30px;
        }
        .item-table th {
            background-color: #1e3a8a;
            color: white;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
            border: 1px solid #1e3a8a;
        }
        .item-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .totals-table {
            width: 320px;
            margin-left: auto;
            margin-bottom: 40px;
            font-size: 13px;
        }
        .totals-table td {
            padding: 6px 10px;
        }
        .totals-label {
            color: #555;
            text-align: right;
        }
        .totals-value {
            text-align: right;
            font-weight: 500;
        }
        .grand-total-row td {
            border-top: 1.5px solid #1e3a8a;
            border-bottom: 1.5px solid #1e3a8a;
            font-weight: bold;
            font-size: 15px;
            color: #1e3a8a;
            background-color: #f8fafc;
        }
        .words-section {
            font-size: 12px;
            margin-top: 5px;
            font-style: italic;
            color: #555;
        }
        .signatory-table {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .signatory-table td {
            vertical-align: bottom;
        }
        .assets-box {
            text-align: right;
            padding-right: 10px;
        }
        .seal-img {
            max-height: 80px;
            margin-right: 25px;
            vertical-align: bottom;
        }
        .signature-img {
            max-height: 50px;
            vertical-align: bottom;
        }
        .signatory-text {
            text-align: right;
            font-size: 12px;
            margin-top: 10px;
            line-height: 1.5;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            font-size: 10px;
            color: #888;
        }
        .footer-note {
            margin-bottom: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="container">
        <!-- Header Section -->
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    @if($logo)
                        <div class="logo-container">
                            <img class="logo-img" src="{{ $logo }}" alt="Logo">
                        </div>
                    @endif
                    <div class="company-name">{{ $invoice->company->company_name }}</div>
                    <div class="company-details">
                        @if($invoice->company->gstin)
                            <strong>GSTIN:</strong> {{ $invoice->company->gstin }}<br>
                        @endif
                        {{ $invoice->company->address_line1 }}
                        @if($invoice->company->address_line2)
                            , {{ $invoice->company->address_line2 }}
                        @endif
                        <br>
                        {{ $invoice->company->city }}, {{ $invoice->company->state }} - {{ $invoice->company->pincode }}
                        <br>
                        @if($invoice->company->phone_number)
                            <strong>Phone:</strong> {{ $invoice->company->phone_number }} |
                        @endif
                        @if($invoice->company->email)
                            <strong>Email:</strong> {{ $invoice->company->email }}
                        @endif
                    </div>
                </td>
                <td style="width: 40%;">
                    <div class="invoice-title">INVOICE</div>
                    <table class="invoice-meta-table">
                        <tr>
                            <td class="invoice-meta-label">Invoice No:</td>
                            <td class="invoice-meta-value"><strong>{{ $invoice->invoice_no }}</strong></td>
                        </tr>
                        <tr>
                            <td class="invoice-meta-label">Invoice Date:</td>
                            <td class="invoice-meta-value">{{ $invoice->invoice_date->format('d-m-Y') }}</td>
                        </tr>
                        @if($invoice->due_date)
                            <tr>
                                <td class="invoice-meta-label">Due Date:</td>
                                <td class="invoice-meta-value">{{ $invoice->due_date->format('d-m-Y') }}</td>
                            </tr>
                        @endif
                    </table>
                </td>
            </tr>
        </table>

        <!-- Details Section -->
        <table class="details-table">
            <tr>
                <td>
                    <div class="section-title">Bill To</div>
                    <div class="bill-to-name">{{ $invoice->customer_name }}</div>
                    <div class="bill-to-details">
                        {!! nl2br(e($invoice->customer_address)) !!}
                        @if($invoice->customer_phone)
                            <br><strong>Phone:</strong> {{ $invoice->customer_phone }}
                        @endif
                    </div>
                </td>
                <td>
                    <div class="section-title">Tax Details</div>
                    <div class="bill-to-details" style="margin-top: 4px;">
                        <strong>Place of Supply:</strong> {{ $invoice->place_of_supply ?: 'Not Specified' }}
                        @if($invoice->remarks)
                            <br><br><strong>Remarks / Notes:</strong><br>{{ $invoice->remarks }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>

        <!-- Item Table -->
        <table class="item-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">#</th>
                    <th style="width: 40%;">Item Details</th>
                    <th style="width: 12%;" class="text-right">Rate</th>
                    <th style="width: 8%;" class="text-center">Qty</th>
                    <th style="width: 15%;" class="text-right">Taxable Value</th>
                    <th style="width: 8%;" class="text-center">Tax %</th>
                    <th style="width: 12%;" class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $item->item_name }}</strong></td>
                        <td class="text-right">{{ number_format($item->rate, 2) }}</td>
                        <td class="text-center">{{ $item->qty }}</td>
                        <td class="text-right">{{ number_format($item->taxable_value, 2) }}</td>
                        <td class="text-center">{{ (float)$item->tax_percent }}%</td>
                        <td class="text-right">{{ number_format($item->total_amount, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals Block -->
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <div class="section-title">Total Amount In Words</div>
                    <div class="words-section">
                        {{ $amountInWords }}
                    </div>

                    @if($invoice->company->bank_name || $invoice->company->bank_account_no)
                        <div class="section-title" style="margin-top: 15px;">Bank Details</div>
                        <div class="company-details" style="font-size: 11px; line-height: 1.4; color: #555;">
                            @if($invoice->company->bank_name)
                                <strong>Bank Name:</strong> {{ $invoice->company->bank_name }}<br>
                            @endif
                            @if($invoice->company->bank_branch)
                                <strong>Branch:</strong> {{ $invoice->company->bank_branch }}<br>
                            @endif
                            @if($invoice->company->bank_account_no)
                                <strong>Account No:</strong> {{ $invoice->company->bank_account_no }}<br>
                            @endif
                            @if($invoice->company->bank_ifsc)
                                <strong>IFSC Code:</strong> {{ $invoice->company->bank_ifsc }}<br>
                            @endif
                        </div>
                    @endif
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <table class="totals-table">
                        <tr>
                            <td class="totals-label">Taxable Amount:</td>
                            <td class="totals-value">{{ number_format($invoice->subtotal, 2) }}</td>
                        </tr>
                        @if($invoice->tax_amount > 0)
                            @php
                                $gstPercent = $invoice->items->first()?->tax_percent ?? 0;
                                $halfGst = (float)$gstPercent / 2;
                            @endphp
                            <tr>
                                <td class="totals-label">CGST ({{ $halfGst }}%):</td>
                                <td class="totals-value">{{ number_format($invoice->tax_amount / 2, 2) }}</td>
                            </tr>
                            <tr>
                                <td class="totals-label">SGST ({{ $halfGst }}%):</td>
                                <td class="totals-value">{{ number_format($invoice->tax_amount / 2, 2) }}</td>
                            </tr>
                        @else
                            <tr>
                                <td class="totals-label">Tax Amount:</td>
                                <td class="totals-value">{{ number_format($invoice->tax_amount, 2) }}</td>
                            </tr>
                        @endif
                        <tr class="grand-total-row">
                            <td class="totals-label"><strong>Grand Total:</strong></td>
                            <td class="totals-value"><strong>{{ number_format($invoice->grand_total, 2) }}</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- HSN/SAC Summary Table -->
        @if($invoice->tax_amount > 0)
        <div style="margin-top: 20px; margin-bottom: 20px; page-break-inside: avoid;">
            <div class="section-title" style="margin-bottom: 6px;">HSN/SAC Summary</div>
            <table style="width: 100%; border: 1px solid #e5e7eb; font-size: 10px; text-align: center; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1.5px solid #e5e7eb; font-weight: bold;">
                        <th style="padding: 6px; border: 1px solid #e5e7eb; width: 15%;">HSN/SAC</th>
                        <th style="padding: 6px; border: 1px solid #e5e7eb; width: 20%;">Taxable Value</th>
                        <th style="padding: 6px; border: 1px solid #e5e7eb; width: 20%;" colspan="2">Central Tax (CGST)</th>
                        <th style="padding: 6px; border: 1px solid #e5e7eb; width: 20%;" colspan="2">State Tax (SGST)</th>
                        <th style="padding: 6px; border: 1px solid #e5e7eb; width: 25%;">Total Tax Amount</th>
                    </tr>
                    <tr style="background-color: #f8fafc; border-bottom: 1.5px solid #e5e7eb; font-size: 8px; font-weight: bold;">
                        <th style="padding: 4px; border: 1px solid #e5e7eb;"></th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb;"></th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb; width: 8%;">Rate</th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb; width: 12%;">Amount</th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb; width: 8%;">Rate</th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb; width: 12%;">Amount</th>
                        <th style="padding: 4px; border: 1px solid #e5e7eb;"></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->items as $item)
                        @if($item->tax_amount > 0)
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 5px; border: 1px solid #e5e7eb; font-weight: 500;">-</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($item->taxable_value, 2) }}</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;">{{ (float)$item->tax_percent / 2 }}%</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($item->tax_amount / 2, 2) }}</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;">{{ (float)$item->tax_percent / 2 }}%</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($item->tax_amount / 2, 2) }}</td>
                            <td style="padding: 5px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($item->tax_amount, 2) }}</td>
                        </tr>
                        @endif
                    @endforeach
                    <tr style="background-color: #f8fafc; font-weight: bold; border-top: 1.5px solid #e5e7eb;">
                        <td style="padding: 6px; border: 1px solid #e5e7eb;">TOTAL</td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($invoice->subtotal, 2) }}</td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;"></td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($invoice->tax_amount / 2, 2) }}</td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;"></td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($invoice->tax_amount / 2, 2) }}</td>
                        <td style="padding: 6px; border: 1px solid #e5e7eb;" class="text-right">{{ number_format($invoice->tax_amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        @endif

        <!-- Signatory Block -->
        <table class="signatory-table" style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <!-- Left side empty or terms -->
                </td>
                <td style="width: 50%; text-align: right;">
                    <div class="assets-box">
                        @if($seal)
                            <img class="seal-img" src="{{ $seal }}" alt="Seal">
                        @endif
                        @if($signature)
                            <img class="signature-img" src="{{ $signature }}" alt="Signature">
                        @endif
                    </div>
                    <div class="signatory-text">
                        For <strong>{{ $invoice->company->company_name }}</strong>
                        <br><br><br>
                        @if($invoice->company->signer_name)
                            <span style="font-weight: bold; font-size: 11px; color: #333; display: block; margin-bottom: 2px;">{{ $invoice->company->signer_name }}</span>
                        @endif
                        Authorized Signatory
                    </div>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-note">{{ $invoice->company->footer_text ?: 'Thank you for your business!' }}</div>
            <div>This is a computer-generated document and requires no signature.</div>
        </div>

    </div>

</body>
</html>
