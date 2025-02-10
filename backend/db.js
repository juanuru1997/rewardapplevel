const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("🔹 Intentando conectar a MongoDB..."); // Log informativo
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Tiempo de espera para conexión
        });

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
