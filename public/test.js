// const idNumber = '0402031234234';
// const id = idNumber.toString();
// const yymmdd = id.substring(0, 6);

// // Extract the year, month, and day components
// const firstTwoDigitsOfYear = parseInt(yymmdd.substring(0, 2));
// console.log('year digits', firstTwoDigitsOfYear);
// const currentYear = new Date().getFullYear();

// // Determine the century based on the two-digit year
// const century = firstTwoDigitsOfYear <= currentYear % 100 ? Math.floor(currentYear / 100) * 100 : (Math.floor(currentYear / 100) + 1) * 100;
// const year100 = currentYear % 100;
// console.log('current year % 100', year100);
// console.log('century:', century);
// // Calculate the year by adding the determined century to the two-digit year
// const year = century + firstTwoDigitsOfYear;
// console.log('year', year);
// const month = parseInt(yymmdd.substring(2, 4)) - 1;
// const day = parseInt(yymmdd.substring(4, 6));

// const birth_date = new Date(year, month, day);

// // Format the date as "YYYY-MM-DD"
// const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// console.log(formattedDate);
const currentYear = new Date().getFullYear();
console.log(currentYear);