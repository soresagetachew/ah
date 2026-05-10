// Simple Ethiopian Birr amount to words converter
const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const scales = ['', 'Thousand', 'Million', 'Billion'];

const convertLessThanOneThousand = (num: number): string => {
  let word = '';
  
  if (num % 100 < 20) {
    word = units[num % 100];
    num = Math.floor(num / 100);
  } else {
    word = units[num % 10];
    num = Math.floor(num / 10);
    word = tens[num % 10] + (word ? ' ' + word : '');
    num = Math.floor(num / 10);
  }
  
  if (num === 0) return word;
  return units[num] + ' Hundred' + (word ? ' and ' + word : '');
};

export const amountToWords = (amount: number): string => {
  if (amount === 0) return 'Zero Birr Only';
  
  const dollars = Math.floor(amount);
  let cents = Math.round((amount - dollars) * 100);
  
  if (dollars === 0) {
    return `${cents}/100 Birr Only`;
  }
  
  let numStr = dollars.toString();
  let word = '';
  let scaleIdx = 0;
  
  while (numStr.length > 0) {
    const chunk = parseInt(numStr.slice(-3), 10);
    if (chunk !== 0) {
      const chunkWord = convertLessThanOneThousand(chunk);
      word = chunkWord + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '') + (word ? ' ' + word : '');
    }
    numStr = numStr.slice(0, -3);
    scaleIdx++;
  }
  
  const centStr = cents > 0 ? ` and ${cents}/100` : '';
  return `${word.trim()} Birr${centStr} Only`;
};
