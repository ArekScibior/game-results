const MongoClient = require('mongodb').MongoClient;

var uri = "mongodb+srv://<user>:<password>@<cluster>/test"

async function getConnection() {
	MongoClient.connect(uri, function(err, connection) {
        if (err) throw err;
        closeConnection(connection);
    })
}

var closeConnection = function(connection) {
    connection.close();
}

getConnection();