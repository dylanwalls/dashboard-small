const sql = require('mssql');

module.exports = async function (context, req) {
  try {
    console.log('Starting function')
    // Your database connection configuration
    const config = {
      user: 'dylanwalls',
      password: '950117Dy!',
      server: 'scorecard-server.database.windows.net',
      database: 'dashboard-new-server',
    };

    // Connect to the database
    await sql.connect(config);

    // Query the database to retrieve emails
    const queryResult = await sql.query('SELECT Email FROM ContactInfo');

    // Extract the emails from the query result
    const emails = queryResult.recordset.map((row) => row.Email);

    // Send the list of emails as the HTTP response
    context.res = {
      headers: {
        'Access-Control-Allow-Origin': '*', // This allows requests from any origin during development
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Add other allowed HTTP methods as needed
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Add other allowed headers as needed
      },
      body: emails,
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: 'Error querying the database',
    };
  }
};
