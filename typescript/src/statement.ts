type Plays = {
  [key: string]: {
    name: string;
    type: string;
  };
};

type Performance = {
  playID: string;
  audience: number;
};

type Invoice = {
  customer: string;
  performances: Performance[];
};

type Amount = {
  amount: number;
  credits: number;
}

interface ReportLine {
  performanceName: string;
  amountGenerated: Amount;
  audience: number;
}

function statement(invoice: Invoice, plays: Plays) {
  const invalidPerformance = invoice.performances.find( (performance) => {
    return plays[performance.playID].type !== "tragedy" && plays[performance.playID].type !== "comedy";
  })
  if (invalidPerformance !== undefined) {
    throw new Error(`unknown type: ${plays[invalidPerformance.playID].type}`);    
  }

  const format = buildCurrencyFormatter();
  const reportLines: ReportLine[] = [];
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const amountGenerated: Amount = {amount: 0, credits: 0};
    switch (play.type) {
      case "tragedy":
        amountGenerated.amount = calculateAmountTragedy(perf.audience);
        amountGenerated.credits = calculateCreditsTragedy(perf.audience); 
        break;
      case "comedy":
        amountGenerated.amount = calculateAmountComedy(perf.audience);
        amountGenerated.credits = calculateCreditsComedy(perf.audience); 
        break;
    }
    const reportLine = {
      performanceName: play.name,
      amountGenerated,
      audience: perf.audience
    }
    reportLines.push(reportLine);
  }
  let result = buildResult(invoice, reportLines, format);
  return result;
}

export { statement };

  function buildResult(invoice: Invoice, reportLines: ReportLine[], format: { (value: number): string; (value: number | bigint): string; }) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    for (let reportLine of reportLines) {
      totalAmount += reportLine.amountGenerated.amount;
      volumeCredits += reportLine.amountGenerated.credits;
      // print line for this order
      result += ` ${reportLine.performanceName}: ${format(reportLine.amountGenerated.amount / 100)} (${reportLine.audience} seats)\n`;

    }

    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
  }

  /**
   * Add volume credits.
   * Also add extra credit for every five comedy attendees
   * @param audience 
   * @returns 
   */
  function calculateCreditsComedy(audience: number): number {
    let credits = Math.max(audience - 30, 0);
    credits += Math.floor(audience / 5);
    return credits;
  }

  function calculateCreditsTragedy(audience: number): number {
    return Math.max(audience - 30, 0);
  }

  function calculateAmountComedy(audience: number) {
    let thisAmount = 30000;
    if (audience > 20) {
      thisAmount += 10000 + 500 * (audience - 20);
    }
    thisAmount += 300 * audience;
    return thisAmount;
  }

  function calculateAmountTragedy(audience: number) {
    let thisAmount = 40000;
    if (audience > 30) {
      thisAmount += 1000 * (audience - 30);
    }
    return thisAmount;
  }

  function buildCurrencyFormatter() {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format;
  }
