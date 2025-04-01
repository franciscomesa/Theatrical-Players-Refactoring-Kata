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

function statement(invoice: Invoice, plays: Plays) {
  const invalidPerformance = invoice.performances.find( (performance) => {
    return plays[performance.playID].type !== "tragedy" && plays[performance.playID].type !== "comedy";
  })
  if (invalidPerformance !== undefined) {
    throw new Error(`unknown type: ${plays[invalidPerformance.playID].type}`);    
  }

  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = buildCurrencyFormatter();

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const amountGenerated: Amount = {amount: 0, credits: 0};
    switch (play.type) {
      case "tragedy":
        amountGenerated.amount = calculateAmountTragedy(perf.audience);
        break;
      case "comedy":
        amountGenerated.amount = calculateAmountComedy(perf.audience);
        break;
    }
    // add volume credits
    amountGenerated.credits = Math.max(perf.audience - 30, 0);
    // add extra credit for every five comedy attendees
    if ("comedy" === play.type) amountGenerated.credits += Math.floor(perf.audience / 5);
    // print line for this order
    result += ` ${play.name}: ${format(amountGenerated.amount / 100)} (${perf.audience} seats)\n`;
    totalAmount += amountGenerated.amount;
    volumeCredits += amountGenerated.credits;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}

export { statement };

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
