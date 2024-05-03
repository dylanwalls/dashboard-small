// dataFilter.js

function filterData(data, criteria, currentTable) {
    let filteredData = data;

    if (criteria.itemsPerPage) {
        filteredData = filterByItemsPerPage(filteredData, criteria.itemsPerPage);
    }
    if (criteria.year && currentTable === 'rentRoll') { // Check if year filter is applied
        filteredData = filterByYear(filteredData, criteria.year);
    }
    if (criteria.month && currentTable === 'rentRoll') {
        filteredData = filterByMonth(filteredData, criteria.month);
    }
    if (criteria.homeowner) {
        filteredData = filterByHomeowner(filteredData, criteria.homeowner);
    }
    if (criteria.unitRef) {
        filteredData = filterByUnitRef(filteredData, criteria.unitRef);
    }

    // Sort the filtered data by month and unit_ref
    filteredData = sortData(filteredData);
    console.log('Data filtered');
    return filteredData;
}

function sortData(data) {
    // console.log('sorting');
    // Sort data by month, then by homeowner, and then by unit_ref
    return data.sort((a, b) => {
        // First, sort by month
        if (a.month !== b.month) {
            return a.month - b.month;
        }

        // // If months are the same, sort by homeowner
        // const homeownerComparison = a.homeowner.localeCompare(b.homeowner);
        // if (homeownerComparison !== 0) {
        //     return homeownerComparison;
        // }

        // If months are the same, sort by chron_order
        if (a.chron_order !== b.chron_order) {
            return a.chron_order - b.chron_order;
        }

        // If homeowners are the same, sort by unit_ref
        return a.unit_ref.localeCompare(b.unit_ref);
    });
}

function filterByYear(data, year) {
    // Logic to filter data by year
    // Example: Return items where the 'year' property matches the specified year
    return data.filter(item => item.year === year);
}

function filterByMonth(data, month) {
    // Logic to filter data by month
    // Example: Return items where the 'month' property matches the specified month
    return data.filter(item => item.month === month);
}

function filterByHomeowner(data, homeowner) {
    // Logic to filter data by homeowner
    // Example: Return items where the 'homeowner' property contains the specified homeowner string
    const lowercaseHomeowner = homeowner.toLowerCase();
    return data.filter(item => item.homeowner.toLowerCase().includes(lowercaseHomeowner));
}

function filterByUnitRef(data, unit_ref) {
    // Logic to filter data by unit reference
    // Example: Return items where the 'unitRef' property contains the specified unitRef string
    const lowercaseUnitRef = unit_ref.toLowerCase();
    return data.filter(item => item.unit_ref.toLowerCase().includes(lowercaseUnitRef));
}

export { filterData };
